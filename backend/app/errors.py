"""JSON error handling for the /api namespace."""

from __future__ import annotations

from flask import Flask, jsonify, request
from werkzeug.exceptions import HTTPException


class ApiError(Exception):
    """Raised anywhere in the API to produce a JSON error response."""

    def __init__(self, message: str, status: int = 400, code: str | None = None):
        super().__init__(message)
        self.message = message
        self.status = status
        self.code = code or _default_code(status)

    def to_response(self):
        return jsonify({"error": {"code": self.code, "message": self.message}}), self.status


def _default_code(status: int) -> str:
    return {
        400: "bad_request",
        401: "unauthorized",
        403: "forbidden",
        404: "not_found",
        409: "conflict",
        415: "unsupported_media_type",
        422: "unprocessable",
        502: "upstream_error",
    }.get(status, "error")


def register_error_handlers(app: Flask) -> None:
    @app.errorhandler(ApiError)
    def _handle_api_error(exc: ApiError):
        return exc.to_response()

    @app.errorhandler(HTTPException)
    def _handle_http_error(exc: HTTPException):
        # Only take over /api — Flask-Admin's pages want HTML error pages.
        if not request.path.startswith("/api"):
            return exc
        return (
            jsonify(
                {
                    "error": {
                        "code": _default_code(exc.code or 500),
                        "message": exc.description,
                    }
                }
            ),
            exc.code or 500,
        )

    @app.errorhandler(Exception)
    def _handle_unexpected(exc: Exception):
        app.logger.exception("Unhandled error")
        if not request.path.startswith("/api"):
            raise exc
        return (
            jsonify({"error": {"code": "internal_error", "message": "Something went wrong."}}),
            500,
        )
