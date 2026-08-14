# HVAC Design Suite

A collection of quick engineering utilities for HVAC design — installed as an installable offline-first web app (PWA). No build tools, no dependencies: plain HTML/CSS/JS.

**Live demo:** https://shaikhnedab.github.io/hvac/
**Repository:** https://github.com/shaikhnedab/hvac

## Tools

| Tool | Path | What it does |
|---|---|---|
| Y-Piece Duct Splitter | [`y/`](y/) | ANS split-size for Y-branch ducts, remaining flow, main & branch velocities with live SVG schematic (SI / IP) |
| Duct & Plenum Sizer | [`duct/`](duct/) | Round/rectangular duct sizing by equal friction or constant velocity, standard round-size lookup with live velocity & friction, capsule/flat-oval sizer (SMACNA Heyt-Diaz method), plenum box sizer (US / SI) |
| Psychrometric Calculator | [`psy/`](psy/) | Full air-property calculator (RH / wet bulb / dew point interlocking), ISHRAE 1.0% peak city presets, dual-unit results (SI / IP) |
| Chilled Water Pipe Sizer | [`chw/`](chw/) | Pipe sizing from AHU tonnage (2.4/2.6 GPM/TR), 4 & 5 ft/100 ft friction charts, velocity-based oversize table |
| Unit Converter | [`conv/`](conv/) | Length, area, flow, temperature, pressure, cooling power — all HVAC units with instant conversion |

## Features

- Sticky cross-tool navigation, consistent on every page and screen size
- Click-to-apply industry benchmark rows and standard sizes
- Dual-unit (SI + IP) results everywhere, copy-to-clipboard buttons
- Dark engineering theme, responsive from phones to widescreen
- **PWA:** installable (Add to Home Screen), works fully offline via service worker

## Engineering Conventions & Formulas

### Shared unit conventions

All tools use the site-wide approximation **1 inch = 25 mm** (not 25.4 mm) — inch and metric results are consistent with each other throughout, and standard metric duct/pipe sizes are directly usable.

Key conversion factors used:

| Conversion | Factor |
|---|---|
| 1 in | 25 mm |
| 1 ft | 300 mm (= 12 in at 25 mm/in) |
| 1 L/s | 2.1189 CFM |
| 1 CFM | 0.4719 L/s |
| 1 m³/h | 0.5886 CFM |
| 1 m/s | 196.85 FPM |
| 1 bar | 100 kPa |
| 1 psi | 6.89476 kPa |
| 1 in.wg | 0.249089 kPa (4.01865 in.wg/kPa) |
| 1 TR | 3.51685 kW |
| 1 HP (mech.) | 0.7457 kW |
| °F | °C × 9/5 + 32 (K = °C + 273.15) |
| 1 Pa/m ⇄ in.wg/100 ft | × / ÷ 0.0401865 |

### Chilled Water Pipe Sizer (`chw/`)

- Flow rule: **2.4 or 2.6 GPM/TR** (selected); flow GPM = TR × GPM/TR.
- Built-in capacity charts: sizes ≤ 4" at **4 ft/100 ft** and **5 ft/100 ft** friction, sizes 5–12" on a velocity basis (5" @ 208 TR up to 12" @ 1174 TR), all published at 2.4 GPM/TR and re-rated for the selected standard: `capacity = base × 2.4 / GPM-per-TR`.
- **Safe recommendation** = smallest pipe whose rated capacity ≥ tonnage; **borderline option** = one size smaller when tonnage is within a 15% buffer of its capacity.
- Full sizing table with safe/borderline row highlighting; results copy to clipboard.

### Duct & Plenum Sizer (`duct/`)

- **Equal friction** round diameter (Altshuler-Tsal equation):
  `D = (0.10913 · Q¹·⁹ / f)^(1/5.02)` — D in inches, Q in CFM, f in in.wg/100 ft.
  Friction from a given size: `f = 0.10913 · Q¹·⁹ / D⁵·⁰²`.
- **Constant velocity:** `A = Q / V`, `D = √(4A/π) × 12`.
- **Rectangular equivalent** (ASHRAE): `Dₑ = 1.30 · (a·b)^0.625 / (a+b)^0.25`; the unknown side is solved by bisection, and an alert fires when the aspect ratio exceeds **4:1**.
- **Standard round sizes:** 23 US sizes (6–60 in) / 17 SI sizes (150–1250 mm); every row shows live velocity & friction at the entered airflow, the closest size auto-highlights, and clicking a row applies it.
- **Capsule / flat oval** (SMACNA Heyt-Diaz): `Dₑ = 1.55 · A^0.625 / P^0.25` with `A = πB²/4 + B(A−B)`, `P = πB + 2(A−B)`; standard 2:1 sizes (12×6 … 48×24 in / 300×150 … 1200×600 mm); guidance keeps B between 40–60% of A.
- **Plenum box:** face area = Q/V; the free side = area ÷ locked side; depth = larger of `side × 1.25` or **18 in** minimum.
- **Benchmarks:** main supply 1200–1500 FPM @ 0.10 in.wg/100 ft · branch 700–900 @ 0.08 · collar/neck 400–600 @ 0.05 · exhaust main 1000–1200 @ 0.10 · fresh-air intake 900–1000 @ 0.08 (SI equivalents shown in m/s and Pa/m).

### Psychrometric Calculator (`psy/`)

- **Saturation vapor pressure** (Magnus/Tetens, mbar): `p_ws = 6.1078 · 10^(7.5t / (237.3 + t))`, t in °C.
- **Dew point** inverse: `t_dp = 237.3 · c / (7.5 − c)` with `c = log₁₀(p_v / 6.1078)`.
- **Wet bulb** psychrometric relation: `p_v = p_ws,wb − (p · (t − t_wb) / 1512) · (1 + 0.00114 · t_wb)`; wet bulb is solved by bisection (20 iterations).
- **Barometric pressure at altitude** (ISA): `p = 1013.25 · (1 − 2.25577×10⁻⁵ · z)^5.25588` mbar, z in metres.
- **Humidity ratio:** `W = 0.621945 · p_v / (p − p_v)`.
- **Enthalpy:** `h = 1.006t + W(2501 + 1.86t)` kJ/kg; IP form `h = 0.240t_F + W(1061 + 0.444t_F)` Btu/lb.
- **Specific volume:** `v = 287.055 · (t + 273.15) · (1 + 1.6078W) / (p·100)` m³/kg.
- RH / wet bulb / dew point are **interlocked** — changing any input recomputes the other two (whichever is not active).
- **ISHRAE 1.0% peak presets:** New Delhi, Mumbai, Chennai, Kolkata, Hyderabad, Bengaluru — DB/WB/altitude loaded with one click.
- Supersaturated inputs (DP/WB above DB) are clamped and flagged with a warning.

### Y-Piece Duct Splitter (`y/`)

- **ANS throat size:** `ANS = (Z / X) · A` (branch airflow ÷ main airflow × main duct width); rounded to the nearest **0.5 in** in IP and nearest **mm** in SI.
- Remaining flow: `Y = X − Z`; velocities from `V = Q / (W·H / 144)` FPM (main and branch S-1 through E × F).
- A warning fires when the ANS throat exceeds the branch duct width E.

## Deployment

The included [GitHub Actions workflow](.github/workflows/static.yml) auto-deploys the `master` branch to GitHub Pages.

## Tech

Plain HTML / CSS / JavaScript — open the files directly or serve the folder (`python -m http.server 8000`). No frameworks, no build step.