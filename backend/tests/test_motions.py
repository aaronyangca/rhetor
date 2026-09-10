"""Motion lifecycle tests.

The provider call is stubbed — these cover Rhetor's own logic (stage
progression, invalidation, ownership), not the models' output.
"""

import pytest

from app import llm
from app.blueprints.motions import _clamp_title
from app.llm.base import Generation


@pytest.mark.parametrize(
    ("raw", "expected"),
    [
        ("THW Ban Zoos (OG)", "THW Ban Zoos (OG)"),
        # A leaked stage word — the title is fixed for the motion's life.
        ("OG — Ecosystem Personhood Seeds", "Ecosystem Personhood"),
        ("Rewilding Bench (OG)", "Rewilding (OG)"),
        ("CG: Nuclear Power Case File", "Nuclear Power"),
        # Position belongs in a trailing "(OG)", never as a leading token.
        ("OO - Free Speech", "Free Speech"),
    ],
)
def test_clamp_title_strips_stage_jargon_and_a_leading_position(raw, expected):
    assert _clamp_title(raw) == expected


@pytest.fixture
def fake_llm(monkeypatch):
    """Replace the provider call with a deterministic canned generation."""
    calls = []

    def fake_generate(*, user, provider, model, system, history, schema, web_search=False):
        calls.append(
            {
                "provider": provider,
                "model": model,
                "system": system,
                "history": history,
                "schema": schema,
                "web_search": web_search,
            }
        )
        payload = {"reply": "Here you go.", "document": f"# Document {len(calls)}"}
        if "title" in schema["properties"]:
            payload |= {
                "title": "Ban private schools",
                "motionText": "This House Would ban private schools",
                "position": "OG",
            }
        return Generation.from_payload(payload)

    monkeypatch.setattr(llm, "generate", fake_generate)
    return calls


@pytest.mark.parametrize("provider", ["openai", "anthropic", "gemini"])
def test_creating_a_motion_requires_a_key_for_that_provider(auth_client, provider):
    response = auth_client.post("/api/motions", json={"provider": provider})
    assert response.status_code == 400
    assert "account settings" in response.get_json()["error"]["message"]


@pytest.mark.parametrize("provider", ["openai", "anthropic", "gemini"])
def test_a_motion_can_run_on_any_provider(keyed_client, fake_llm, provider):
    created = keyed_client.post("/api/motions", json={"provider": provider})
    assert created.status_code == 201

    motion_id = created.get_json()["id"]
    response = keyed_client.post(
        f"/api/motions/{motion_id}/messages", json={"content": "THW ban private schools, OG"}
    )

    assert response.status_code == 200
    assert response.get_json()["motion"]["provider"] == provider
    assert fake_llm[0]["provider"] == provider


def test_creating_a_motion_makes_no_provider_call(keyed_client, fake_llm):
    """The opening message is a fixed string — creating a motion must not spend
    a single token."""
    from app.blueprints.motions import OPENING_MESSAGE

    created = keyed_client.post("/api/motions", json={"provider": "openai"})
    assert created.status_code == 201

    assert fake_llm == []  # llm.generate was never called

    messages = created.get_json()["messages"]
    assert len(messages) == 1
    assert messages[0]["role"] == "assistant"
    assert messages[0]["content"] == OPENING_MESSAGE


def test_an_unknown_provider_is_rejected(keyed_client):
    response = keyed_client.post("/api/motions", json={"provider": "grok"})
    assert response.status_code == 422


def test_new_motion_opens_with_the_assistant_asking_for_the_motion(motion):
    assert motion["currentStage"] == 1
    assert motion["motionText"] is None
    assert len(motion["messages"]) == 1
    assert motion["messages"][0]["role"] == "assistant"


def test_first_message_sets_title_motion_and_position(keyed_client, motion, fake_llm):
    response = keyed_client.post(
        f"/api/motions/{motion['id']}/messages",
        json={"content": "THW ban private schools, I'm OG"},
    )

    assert response.status_code == 200
    updated = response.get_json()["motion"]
    assert updated["title"] == "Ban private schools"
    assert updated["motionText"] == "This House Would ban private schools"
    assert updated["position"] == "OG"
    assert updated["stageDocs"]["1"] == "# Document 1"


def test_second_message_uses_the_plain_turn_schema(keyed_client, motion, fake_llm):
    url = f"/api/motions/{motion['id']}/messages"
    keyed_client.post(url, json={"content": "THW ban private schools, OG"})
    keyed_client.post(url, json={"content": "Add an argument about social mobility"})

    assert "title" in fake_llm[0]["schema"]["properties"]
    assert "title" not in fake_llm[1]["schema"]["properties"]


def test_advancing_requires_a_document_for_the_current_stage(keyed_client, motion):
    response = keyed_client.post(f"/api/motions/{motion['id']}/advance", json={})
    assert response.status_code == 409


def test_advancing_moves_to_the_next_stage_and_generates_its_document(
    keyed_client, motion, fake_llm
):
    keyed_client.post(f"/api/motions/{motion['id']}/messages", json={"content": "THW x, OG"})
    response = keyed_client.post(f"/api/motions/{motion['id']}/advance", json={})

    assert response.status_code == 200
    updated = response.get_json()
    assert updated["currentStage"] == 2
    assert updated["stageDocs"]["2"] == "# Document 2"
    # Stage 1's document survives untouched.
    assert updated["stageDocs"]["1"] == "# Document 1"


def test_web_search_is_enabled_only_for_stage_2(keyed_client, motion, fake_llm):
    keyed_client.post(f"/api/motions/{motion['id']}/messages", json={"content": "THW x, OG"})
    keyed_client.post(f"/api/motions/{motion['id']}/advance", json={})

    assert fake_llm[0]["web_search"] is False  # stage 1
    assert fake_llm[1]["web_search"] is True  # stage 2


def test_editing_an_earlier_stage_invalidates_later_documents(keyed_client, motion, fake_llm):
    motion_id = motion["id"]
    keyed_client.post(f"/api/motions/{motion_id}/messages", json={"content": "THW x, OG"})
    keyed_client.post(f"/api/motions/{motion_id}/advance", json={})

    # Go back to stage 1 and change it.
    keyed_client.patch(f"/api/motions/{motion_id}", json={"currentStage": 1})
    response = keyed_client.post(
        f"/api/motions/{motion_id}/messages", json={"content": "Drop the third argument"}
    )

    updated = response.get_json()["motion"]
    assert updated["currentStage"] == 1
    assert updated["stageDocs"]["2"] is None


def test_stage_2_chat_history_survives_invalidation(keyed_client, motion, fake_llm):
    """Re-advancing feeds prior stage-2 discussion back in, so it isn't lost."""
    motion_id = motion["id"]
    keyed_client.post(f"/api/motions/{motion_id}/messages", json={"content": "THW x, OG"})
    keyed_client.post(f"/api/motions/{motion_id}/advance", json={})
    keyed_client.post(f"/api/motions/{motion_id}/messages", json={"content": "Sharpen impacts"})

    keyed_client.patch(f"/api/motions/{motion_id}", json={"currentStage": 1})
    keyed_client.post(f"/api/motions/{motion_id}/messages", json={"content": "Reword claim 2"})
    keyed_client.post(f"/api/motions/{motion_id}/advance", json={})

    stage_2 = [m for m in keyed_client.get(f"/api/motions/{motion_id}").get_json()["messages"]
               if m["stage"] == 2]
    assert any("Sharpen impacts" in m["content"] for m in stage_2)
    # And that history was passed to the regeneration call.
    assert any("Sharpen impacts" in t.content for t in fake_llm[-1]["history"])


def test_cannot_jump_forward_to_an_ungenerated_stage(keyed_client, motion, fake_llm):
    keyed_client.post(f"/api/motions/{motion['id']}/messages", json={"content": "THW x, OG"})
    response = keyed_client.patch(f"/api/motions/{motion['id']}", json={"currentStage": 3})
    assert response.status_code == 409


def test_can_step_forward_one_stage_once_the_current_one_has_a_document(
    keyed_client, motion, fake_llm
):
    mid = motion["id"]
    # No document yet -> nothing to build on.
    assert keyed_client.patch(f"/api/motions/{mid}", json={"currentStage": 2}).status_code == 409

    # A message produces the Stage 1 document; now the step forward is allowed
    # and makes no LLM call of its own.
    keyed_client.post(f"/api/motions/{mid}/messages", json={"content": "THW x, OG"})
    calls_before = len(fake_llm)
    response = keyed_client.patch(f"/api/motions/{mid}", json={"currentStage": 2})

    assert response.status_code == 200
    assert response.get_json()["currentStage"] == 2
    assert len(fake_llm) == calls_before  # the step itself did not generate
    assert keyed_client.get(f"/api/motions/{mid}").get_json()["stageDocs"]["2"] is None


def test_a_failed_provider_call_does_not_persist_the_user_message(
    keyed_client, motion, monkeypatch
):
    def boom(**kwargs):
        raise llm.LLMError("Provider is down")

    monkeypatch.setattr(llm, "generate", boom)

    response = keyed_client.post(
        f"/api/motions/{motion['id']}/messages", json={"content": "THW x, OG"}
    )
    assert response.status_code == 502

    messages = keyed_client.get(f"/api/motions/{motion['id']}").get_json()["messages"]
    assert len(messages) == 1  # just the opening assistant message


def test_export_returns_markdown_for_the_current_stage(keyed_client, motion, fake_llm):
    keyed_client.post(f"/api/motions/{motion['id']}/messages", json={"content": "THW x, OG"})
    response = keyed_client.get(f"/api/motions/{motion['id']}/export")

    assert response.status_code == 200
    assert response.get_data(as_text=True) == "# Document 1"
    assert "attachment" in response.headers["Content-Disposition"]


def test_export_returns_pdf(keyed_client, motion, fake_llm):
    keyed_client.post(f"/api/motions/{motion['id']}/messages", json={"content": "THW x, OG"})
    response = keyed_client.get(f"/api/motions/{motion['id']}/export?format=pdf")

    assert response.status_code == 200
    assert response.mimetype == "application/pdf"
    assert response.get_data().startswith(b"%PDF-")
    assert response.headers["Content-Disposition"].endswith('.pdf"')


def test_export_rejects_unknown_format(keyed_client, motion, fake_llm):
    keyed_client.post(f"/api/motions/{motion['id']}/messages", json={"content": "THW x, OG"})
    response = keyed_client.get(f"/api/motions/{motion['id']}/export?format=docx")
    assert response.status_code == 422


def test_another_users_motion_is_not_found(client, motion, credentials):
    client.post("/api/auth/logout")
    client.post("/api/auth/signup", json={"email": "other@example.com", "password": "another pass"})

    assert client.get(f"/api/motions/{motion['id']}").status_code == 404
    assert client.delete(f"/api/motions/{motion['id']}").status_code == 404


def test_renaming_a_motion(keyed_client, motion):
    response = keyed_client.patch(f"/api/motions/{motion['id']}", json={"title": "Schools, OG"})
    assert response.get_json()["title"] == "Schools, OG"
