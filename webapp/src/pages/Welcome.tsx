import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { LogoMark } from '../components/Logo'
import { Button } from '../components/Button'

// Every coordinate below is read directly from ui-design.pen (node w7kbo1,
// "Welcome"), authored on a 1440x900 canvas — converted to percentages so
// the scene scales with the viewport instead of hand-approximated.
const CW = 1440
const CH = 900
const px = (v: number) => `${(v / CW) * 100}%`
const py = (v: number) => `${(v / CH) * 100}%`
const range = (n: number) => Array.from({ length: n }, (_, i) => i)

/** Flat rectangle positioned/sized from real canvas coordinates. */
function Rect({
  x,
  y,
  w,
  h,
  fill,
  radius,
  opacity,
}: {
  x: number
  y: number
  w: number
  h: number
  fill: string
  radius?: number
  opacity?: number
}) {
  return (
    <div
      className="absolute"
      style={{ left: px(x), top: py(y), width: px(w), height: py(h), background: fill, borderRadius: radius, opacity }}
    />
  )
}

/** One or more literal SVG paths in real 1440x900 canvas coordinates — for organic
 *  shapes (flames, lamp bowls) that a CSS approximation can't reproduce faithfully. */
function CanvasPaths({ paths }: { paths: { d: string; fill: string; opacity?: number }[] }) {
  return (
    <svg viewBox="0 0 1440 900" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
      {paths.map((p, i) => (
        <path key={i} d={p.d} fill={p.fill} opacity={p.opacity} />
      ))}
    </svg>
  )
}

/** A blind arch: flat-sided, semicircular top, built from a rect + a half-ellipse cap.
 *  `y`/`h` describe the straight-sided part only (the arch's spring line down to its
 *  base), matching the source path's `l0,-h a r,r 0 0 1 w,0` — the semicircular cap
 *  then adds another full radius `r` of height *above* that spring line, so the
 *  shape's true top is `y - r`, not `y`. */
function Arch({
  x,
  y,
  h,
  w,
  fill,
  opacity,
}: {
  x: number
  y: number
  h: number
  w: number
  fill: string
  opacity?: number
}) {
  const r = w / 2
  return (
    <>
      <Rect x={x} y={y} w={w} h={h} fill={fill} opacity={opacity} />
      <div
        className="absolute"
        style={{
          left: px(x),
          top: py(y - r),
          width: px(w),
          height: py(r),
          background: fill,
          opacity,
          borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
        }}
      />
    </>
  )
}

function CeilingCornice() {
  return (
    <>
      <Rect
        x={-40}
        y={0}
        w={1520}
        h={200}
        fill="linear-gradient(180deg, #151B33 0%, #1A2140 50%, #212949 100%)"
      />
      <Rect x={-40} y={196} w={1520} h={11} fill="#2E3868" />
      <Rect x={-40} y={207} w={1520} h={7} fill="#171D39" />
      <Rect x={-40} y={214} w={1520} h={15} fill="#262E58" />
      <Rect x={-40} y={229} w={1520} h={5} fill="#141A33" />
    </>
  )
}

function UpperGallery() {
  return (
    <>
      {range(13).map((i) => (
        <div key={i}>
          <Arch x={-101 + i * 126} y={99} h={73} w={90} fill="#242C50" />
          <Arch x={-93 + i * 126} y={99} h={73} w={74} fill="#10152B" />
        </div>
      ))}
      {range(12).map((i) => (
        <Rect key={i} x={-4 + i * 126} y={54} w={22} h={118} fill="#2A3358" />
      ))}
      {range(13).map((i) => (
        <div
          key={i}
          className="absolute"
          style={{ left: px(-64 + i * 126), top: py(52), width: px(16), height: py(18), background: '#333C72' }}
        />
      ))}
      <Rect x={-60} y={172} w={1560} h={11} fill="#2C3663" />
      <Rect x={-60} y={183} w={1560} h={6} fill="#141A33" />
    </>
  )
}

function Clerestory() {
  return (
    <>
      {[1239, 1081, 923, 765, 607].map((x, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: px(x),
            top: py(320),
            width: px(190),
            height: py(240),
            background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(247,200,138,0.27) 0%, rgba(247,200,138,0) 100%)',
          }}
        />
      ))}
      {range(9).map((i) => (
        <Arch key={i} x={28 + i * 158} y={394} h={68} w={84} fill="#2E3868" />
      ))}
      {range(4).map((i) => (
        <Arch key={i} x={35 + i * 158} y={395} h={59} w={70} fill="#2B3358" />
      ))}
      {range(5).map((i) => (
        <Arch
          key={i}
          x={667 + i * 158}
          y={395}
          h={59}
          w={70}
          fill="linear-gradient(180deg, #FFF2D8 0%, #F6CE92 100%)"
        />
      ))}
    </>
  )
}

const IMPOSTS_D =
  'M-158 532l24 0 0 12-24 0z m116 0l24 0 0 12-24 0z m42 0l24 0 0 12-24 0z m116 0l24 0 0 12-24 0z m42 0l24 0 0 12-24 0z m116 0l24 0 0 12-24 0z m42 0l24 0 0 12-24 0z m116 0l24 0 0 12-24 0z m42 0l24 0 0 12-24 0z m116 0l24 0 0 12-24 0z m42 0l24 0 0 12-24 0z m116 0l24 0 0 12-24 0z m42 0l24 0 0 12-24 0z m116 0l24 0 0 12-24 0z m42 0l24 0 0 12-24 0z m116 0l24 0 0 12-24 0z m42 0l24 0 0 12-24 0z m116 0l24 0 0 12-24 0z m42 0l24 0 0 12-24 0z m116 0l24 0 0 12-24 0z m42 0l24 0 0 12-24 0z'

function ArchDetail() {
  return (
    <>
      {range(11).map((i) => (
        <Rect key={i} x={-100 + i * 158} y={464} w={24} h={34} fill="#414A88" />
      ))}
      <CanvasPaths paths={[{ d: IMPOSTS_D, fill: '#333C72' }]} />
    </>
  )
}

function Entablature() {
  return (
    <>
      <Rect x={-40} y={250} w={1520} h={6} fill="#3D4886" />
      <Rect x={-40} y={250} w={1520} h={42} fill="#2B3463" />
      <Rect x={-40} y={292} w={1520} h={10} fill="#161C38" />
    </>
  )
}

function Dentils() {
  return (
    <>
      {range(55).map((i) => (
        <Rect key={i} x={12 + i * 26} y={266} w={13} h={16} fill="#3A4478" />
      ))}
      <Rect x={-40} y={282} w={1520} h={5} fill="#1B2242" />
    </>
  )
}

function Columns() {
  const positions = [-61, 97, 255, 413, 571, 729, 887, 1045, 1203, 1361]
  return (
    <>
      {positions.map((capX, i) => {
        const shaftX = capX + 13
        return (
          <div key={i}>
            <Rect x={capX} y={302} w={104} h={20} fill="#333C72" />
            <Rect x={shaftX} y={322} w={78} h={456} fill="#2B3463" />
            {i > 0 && <Rect x={shaftX} y={322} w={17} h={456} fill="#3D4886" opacity={0.9} />}
            {[26, 40, 54, 68].map((dx, fi) => (
              <Rect key={fi} x={shaftX + dx} y={322} w={2} h={456} fill="#212A54" />
            ))}
            <Rect x={capX} y={778} w={104} h={22} fill="#333C72" />
          </div>
        )
      })}
      <Rect x={-40} y={800} w={1520} h={12} fill="#252D57" />
    </>
  )
}

function ArchNiches() {
  return (
    <>
      {range(11).map((i) => {
        const x0 = -148 + i * 158
        return (
          <div key={i}>
            <Arch x={x0} y={538} h={254} w={120} fill="#2A3360" />
            <Arch x={x0 + 4} y={538} h={254} w={112} fill="#39427A" />
            <Arch
              x={x0 + 8}
              y={538}
              h={254}
              w={104}
              fill="linear-gradient(180deg, #0D1226 0%, #0D1226 54%, #1A2144 73%, #283057 87%, #2E3663 100%)"
            />
            <Arch
              x={x0 + 8}
              y={538}
              h={254}
              w={104}
              fill="linear-gradient(180deg, rgba(15,20,40,0.878) 0%, rgba(15,20,40,0.4) 55%, rgba(27,34,66,0) 100%)"
            />
            <Rect x={x0 + 4} y={786} w={112} h={8} fill="#2E3768" />
          </div>
        )
      })}
    </>
  )
}

/** The stepped stone platform running the width of the hall, at the viewer's feet. */
function Steps() {
  const steps = [
    { x: -40, y: 812, w: 1520, h: 24, fill: '#212A52', edge: '#2C3663' },
    { x: -60, y: 836, w: 1560, h: 26, fill: '#1D2547', edge: '#28315C' },
    { x: -80, y: 862, w: 1600, h: 38, fill: '#191F3D', edge: '#232B52' },
  ]
  return (
    <>
      {steps.map((s, i) => (
        <div key={i}>
          <Rect x={s.x} y={s.y} w={s.w} h={s.h} fill={s.fill} />
          <Rect x={s.x} y={s.y} w={s.w} h={4} fill={s.edge} />
        </div>
      ))}
    </>
  )
}

/** Light falling from a clerestory window: a narrow trapezoid (66 wide at the sill,
 *  74 wide by the time it reaches the floor), not a flat-sided rectangle. */
function LightShafts() {
  const shafts: { x: number; grad: 'dim' | 'bright' }[] = [
    { x: 353, grad: 'dim' },
    { x: 511, grad: 'dim' },
    { x: 669, grad: 'bright' },
    { x: 827, grad: 'bright' },
    { x: 985, grad: 'bright' },
    { x: 1143, grad: 'bright' },
    { x: 1301, grad: 'bright' },
  ]
  return (
    <svg viewBox="0 0 1440 900" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
      <defs>
        <linearGradient id="lightshaft-dim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F7C88A" stopOpacity={0.169} />
          <stop offset="50%" stopColor="#F5B368" stopOpacity={0.071} />
          <stop offset="100%" stopColor="#F5B368" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="lightshaft-bright" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F7C88A" stopOpacity={0.302} />
          <stop offset="50%" stopColor="#F5B368" stopOpacity={0.122} />
          <stop offset="100%" stopColor="#F5B368" stopOpacity={0} />
        </linearGradient>
      </defs>
      {shafts.map((s, i) => (
        <path key={i} d={`M${s.x} 454l66 0 4 352-74 0z`} fill={`url(#lightshaft-${s.grad})`} />
      ))}
    </svg>
  )
}

function RimLights() {
  return (
    <>
      {[972, 1058, 1288, 1374].map((x, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: px(x),
            top: py(300),
            width: px(8),
            height: py(400),
            background: 'linear-gradient(0deg, rgba(224,154,76,0) 0%, rgba(240,172,92,0.48) 50%, rgba(224,154,76,0) 100%)',
          }}
        />
      ))}
    </>
  )
}

interface BrazierData {
  cx: number
  footX: number
  stemX: number
  bowlD: string
  flameOuterD: string
  flameInnerD: string
  embers: { x: number; y: number; size: number; fill: string }[]
}

const BRAZIERS: BrazierData[] = [
  {
    cx: 1018,
    footX: 988,
    stemX: 1009,
    bowlD: 'M980 618l76 0-17 42-42 0z',
    flameOuterD: 'M1021 516c15 38 25 74 22 104-2 25-13 38-25 38-12 0-23-12-25-36-2-28 9-58 19-78-3 18 0 28 5 22-1-20 1-36 4-50z',
    flameInnerD: 'M1023 562c9 28 13 51 11 70-2 15-9 22-15 22-7 0-13-7-14-22-1-17 6-42 18-70z',
    embers: [
      { x: 999, y: 490.6, size: 6.8, fill: '#F5B368B8' },
      { x: 1024.4, y: 467.4, size: 5.2, fill: '#F3A85699' },
      { x: 1009.8, y: 439.8, size: 4.4, fill: '#F0A05070' },
      { x: 1033.2, y: 412.2, size: 3.6, fill: '#EE9C4C4D' },
    ],
  },
  {
    cx: 1334,
    footX: 1304,
    stemX: 1325,
    bowlD: 'M1296 618l76 0-17 42-42 0z',
    flameOuterD: 'M1331 536c-14 32-23 61-20 88 2 22 13 34 24 34 11 0 21-12 23-35 2-24-8-51-17-71 2 14-1 22-6 17 1-15-1-23-4-33z',
    flameInnerD: 'M1330 578c-8 22-13 40-11 56 2 14 8 21 15 21 7 0 12-7 13-21 1-16-6-34-17-56z',
    embers: [
      { x: 1343.8, y: 502.8, size: 6.4, fill: '#F5B368B0' },
      { x: 1320.5, y: 475.5, size: 5, fill: '#F3A85691' },
      { x: 1338, y: 448, size: 4, fill: '#F0A05066' },
      { x: 1316.3, y: 422.3, size: 3.4, fill: '#EE9C4C45' },
    ],
  },
]

/** Freestanding brazier: foot, stem, bowl, two-tone flame, and rising embers. */
function Brazier({ b }: { b: BrazierData }) {
  return (
    <>
      <div
        className="absolute rounded-full"
        style={{
          left: px(b.cx - 150),
          top: py(437),
          width: px(300),
          height: py(300),
          background:
            'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(242,166,80,0.6) 0%, rgba(242,166,80,0.24) 42%, rgba(242,166,80,0) 100%)',
        }}
      />
      <CanvasPaths
        paths={[
          { d: b.flameOuterD, fill: '#DE8F42' },
          { d: b.flameInnerD, fill: '#F7D08A' },
        ]}
      />
      {b.embers.map((e, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{ left: px(e.x), top: py(e.y), width: px(e.size), height: py(e.size), background: e.fill }}
        />
      ))}
      <CanvasPaths paths={[{ d: b.bowlD, fill: '#454E80' }]} />
      <Rect x={b.stemX} y={656} w={18} h={126} fill="#333C68" />
      <Rect x={b.footX} y={780} w={60} h={20} fill="#3A4270" />
    </>
  )
}

function Braziers() {
  return (
    <>
      {BRAZIERS.map((b, i) => (
        <Brazier key={i} b={b} />
      ))}
    </>
  )
}

/** Oil lamp hanging on a chain from the ceiling, in front of one of the lit windows. */
function HangingLamp({ chainX, glowX, flameD, bowlD }: { chainX: number; glowX: number; flameD: string; bowlD: string }) {
  return (
    <>
      <div
        className="absolute rounded-full"
        style={{
          left: px(glowX),
          top: py(292),
          width: px(156),
          height: py(156),
          background:
            'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(242,166,80,0.4) 0%, rgba(242,166,80,0.11) 42%, rgba(242,166,80,0) 100%)',
        }}
      />
      <Rect x={chainX} y={234} w={2} h={120} fill="#39426F" />
      <Rect x={chainX - 5} y={348} w={12} h={6} fill="#4A5488" />
      <CanvasPaths paths={[{ d: flameD, fill: '#F7D08A' }]} />
      <CanvasPaths paths={[{ d: bowlD, fill: '#4A5488' }]} />
    </>
  )
}

const LAMPS = [
  { chainX: 701, glowX: 624, flameD: 'M702 316c9 17 13 32 11 44-2 11-6 16-11 16-5 0-9-5-11-16-2-12 2-27 11-44z', bowlD: 'M676 354l52 0c-3 23-14 32-26 32-12 0-23-9-26-32z' },
  { chainX: 859, glowX: 782, flameD: 'M860 316c9 17 13 32 11 44-2 11-6 16-11 16-5 0-9-5-11-16-2-12 2-27 11-44z', bowlD: 'M834 354l52 0c-3 23-14 32-26 32-12 0-23-9-26-32z' },
  { chainX: 1175, glowX: 1098, flameD: 'M1176 316c9 17 13 32 11 44-2 11-6 16-11 16-5 0-9-5-11-16-2-12 2-27 11-44z', bowlD: 'M1150 354l52 0c-3 23-14 32-26 32-12 0-23-9-26-32z' },
]

function HangingLamps() {
  return (
    <>
      {LAMPS.map((l, i) => (
        <HangingLamp key={i} {...l} />
      ))}
    </>
  )
}

const navLinks = ['How It Works', 'The Method', 'The Rhetor']

export function Welcome() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#12172B]">
      <div className="absolute inset-0 overflow-hidden">
        <Rect x={-40} y={234} w={1520} h={576} fill="#1F2749" />
        <CeilingCornice />
        <UpperGallery />
        <Rect x={-40} y={330} w={1520} h={16} fill="#252E56" />
        <ArchNiches />
        <Clerestory />
        <ArchDetail />
        <Entablature />
        <Columns />
        <Dentils />
        <Steps />
        <LightShafts />
        <RimLights />
        <Braziers />
        <HangingLamps />
      </div>

      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, rgba(18,23,43,0.94) 0%, rgba(18,23,43,0.8) 32%, rgba(18,23,43,0.4) 58%, rgba(18,23,43,0) 78%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 65% 70% at 22% 45%, rgba(14,19,39,0.86) 0%, rgba(14,19,39,0.55) 45%, rgba(14,19,39,0) 75%)',
        }}
      />
      <div
        className="absolute inset-x-0 top-0 h-[150px]"
        style={{ background: 'linear-gradient(180deg, rgba(11,15,32,0.88) 0%, rgba(11,15,32,0.6) 50%, rgba(11,15,32,0) 100%)' }}
      />

      <nav className="relative z-10 flex h-[88px] items-center px-[100px]">
        <Link to="/" className="flex items-center gap-[13px]">
          <LogoMark size={44} className="border-[1.5px] border-[#F7F1E5]" />
          <span className="font-wordmark text-[21px] font-semibold text-[#F7F1E5]">
            R<span style={{ letterSpacing: '2.2px' }}>HETOR</span>
          </span>
        </Link>
        <div className="flex-1" />
        <div className="flex items-center gap-8">
          {navLinks.map((link) => (
            <span key={link} className="text-sm font-medium text-[#C3BCD4]">
              {link}
            </span>
          ))}
          <div className="h-5 w-px bg-[#3A3F5C]" />
          <Link to="/login" className="text-sm font-semibold text-[#F7F1E5]">
            Log in
          </Link>
          <Link to="/signup">
            <Button variant="accent">Sign Up</Button>
          </Link>
        </div>
      </nav>

      <div className="relative z-10 flex min-h-[calc(100vh-88px)] items-center px-[100px]">
        <div className="flex max-w-[600px] flex-col gap-[26px]">
          <div className="text-[11px] font-bold text-accent" style={{ letterSpacing: '2.6px' }}>
            ANCIENT ROME · 1ST CENTURY BCE
          </div>
          <p className="font-serif text-[19px] leading-[29px] text-[#D9D3C6] italic">
            The rhetor was the last teacher a young Roman ever had — the master who took him at
            sixteen and taught him to stand before a hostile senate and win.
          </p>
          <div className="h-[2px] w-16 bg-accent" />
          <h1 className="font-display text-[52px] leading-[58px] font-bold text-[#F7F1E5]">
            Two thousand years later, he's yours.
          </h1>
          <p className="text-base leading-[26px] text-[#C3BCD4]">
            Rhetor takes your motion and builds the case the way that master would have —
            drafting arguments, scoring them against the standard real adjudicators judge by, and
            ranking what survives.
          </p>
          <div className="flex items-center gap-[22px]">
            <Link to="/signup">
              <Button variant="accent" className="text-[15px]">
                Start Your Case <ArrowRight size={16} />
              </Button>
            </Link>
            <div className="flex items-center gap-[5px] text-[13.5px]">
              <span className="text-[#A79FC0]">Already have an account?</span>
              <Link to="/login" className="font-semibold text-[#F7F1E5]">
                Log in
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-[100px] z-10 flex max-w-[660px] items-center gap-[11px]">
        <div className="h-px w-[22px] shrink-0 bg-[#6E668A]" />
        <p className="font-serif text-[13.5px] leading-5 text-[#9A92B4] italic">
          Modelled on the controversiae — the simulated trials Roman students argued before they
          ever faced a real one.
        </p>
      </div>
    </div>
  )
}
