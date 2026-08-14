# HVAC Design Suite

**Engineering calculator suite for mechanical HVAC design** — a collection of five production-grade, standards-based utilities delivered as an installable, offline-first progressive web application. Zero runtime dependencies, zero build step: plain HTML, CSS, and JavaScript.

| | |
|---|---|
| **Live Application** | https://shaikhnedab.github.io/hvac/ |
| **Repository** | https://github.com/shaikhnedab/hvac |
| **License** | Proprietary |
| **Deployment** | GitHub Pages (via GitHub Actions) |

---

## Applications

| # | Application | Module | Description |
|---|---|---|---|
| 1 | **Y-Piece Duct Splitter** | [`y/`](y/) | ANS throat sizing for Y-branch duct splits, remaining-flow and velocity analysis with a live vector schematic. Dual-unit (SI / IP). |
| 2 | **Duct & Plenum Sizer** | [`duct/`](duct/) | Round and rectangular duct sizing by equal-friction or constant-velocity methods; standard-size lookup tables; capsule/flat-oval sizing (SMACNA Heyt-Diaz); plenum box dimensioning. Dual-unit (US / SI). |
| 3 | **Psychrometric Calculator** | [`psy/`](psy/) | Complete moist-air property analysis with interlocking relative-humidity / wet-bulb / dew-point inputs and ISHRAE 1.0% peak city presets. Dual-unit (SI / IP). |
| 4 | **Chilled Water Pipe Sizer** | [`chw/`](chw/) | Chilled-water pipe selection from AHU tonnage using 2.4 / 2.6 GPM-per-ton standards, friction-based and velocity-based capacity charts. |
| 5 | **Unit Converter** | [`conv/`](conv/) | Instant multi-field conversion for length, area, airflow, temperature, pressure, and cooling capacity in HVAC unit sets. |

---

## Platform Features

- **Unified navigation** — persistent cross-application toolbar, layout-consistent across all modules and viewport sizes (desktop, tablet, mobile).
- **Standards-based workflows** — click-to-apply industry benchmark rows and standard product sizes reduce lookup time and transcription errors.
- **Dual-unit presentation** — every result is rendered in the active unit system with the equivalent value in the alternate system.
- **Data portability** — one-click copy of results and preset data to the clipboard.
- **Responsive engineering theme** — high-contrast dark interface, optimized for field use on handheld devices.
- **Offline capability** — installable PWA with service-worker caching; fully functional without network access.

---

## Engineering Methodology

### Global Unit Conventions

All modules operate on a site-wide approximation of **1 inch = 25 mm** (rather than the exact 25.4 mm) to keep inch- and metric-based results mutually consistent and aligned with standard commercial product sizes.

| Quantity | Factor |
|---|---|
| Length | 1 in = 25 mm; 1 ft = 300 mm |
| Airflow | 1 L/s = 2.1189 CFM; 1 m³/h = 0.5886 CFM |
| Velocity | 1 m/s = 196.85 FPM |
| Pressure | 1 bar = 100 kPa; 1 psi = 6.89476 kPa; 1 in.wg = 0.249089 kPa (4.01865 in.wg/kPa) |
| Cooling capacity | 1 TR = 3.51685 kW; 1 hp = 0.7457 kW |
| Temperature | °F = 9/5·°C + 32; K = °C + 273.15 |
| Friction (duct) | 1 Pa/m ⇄ 1 in.wg/100 ft at 0.0401865 |

### Chilled Water Pipe Sizing

- Flow generation at **2.4 or 2.6 GPM/TR** (user-selectable); total flow = tonnage × GPM/TR.
- Capacity charts: pipe sizes ≤ 4 in rated at **4 ft/100 ft** and **5 ft/100 ft** friction; sizes 5–12 in rated on a velocity basis (208 TR @ 5 in … 1174 TR @ 12 in). Chart capacities are published at 2.4 GPM/TR and re-rated for the active standard: `capacity = base × 2.4 / (GPM/TR)`.
- Selection logic: **safe recommendation** is the smallest pipe whose rated capacity meets or exceeds the load; a **borderline option** is offered one size smaller when the load falls within a 15% buffer of its capacity.

### Duct Sizing

- **Equal-friction round duct** (Altshuler-Tsal): `D = (0.10913 · Q^1.9 / f)^(1/5.02)`, with `D` in inches, `Q` in CFM, `f` in in.wg/100 ft. Reverse form `f = 0.10913 · Q^1.9 / D^5.02` for friction at a given size.
- **Constant-velocity** sizing: `A = Q/V`, `D = √(4A/π) × 12`.
- **Rectangular equivalents** (ASHRAE): `De = 1.30 · (a·b)^0.625 / (a+b)^0.25`; the unknown side is resolved by bisection, with an advisory when the aspect ratio exceeds **4:1**.
- **Standard round sizes**: 23 US (6–60 in) and 17 SI (150–1250 mm) sizes; live velocity/friction per row at the entered airflow, automatic closest-size highlighting, click-to-apply.
- **Flat oval (capsule) ducts** (SMACNA Heyt-Diaz): `De = 1.55 · A^0.625 / P^0.25`, where `A = πB²/4 + B(A−B)` and `P = πB + 2(A−B)`; 2:1 standard sizes supplied; minor axis guidance 40–60% of major axis.
- **Plenum boxes**: face area = Q/V; free side = area ÷ locked dimension; depth = max(side × 1.25, 18 in).
- **Design benchmarks**: main supply 1200–1500 FPM @ 0.10 in.wg/100 ft; branch 700–900 FPM @ 0.08; collar/neck 400–600 FPM @ 0.05; exhaust mains 1000–1200 FPM @ 0.10; fresh-air intake 900–1000 FPM @ 0.08 (SI equivalents in m/s and Pa/m).

### Psychrometric Analysis

- **Saturation vapor pressure** (Magnus/Tetens, mbar): `p_ws = 6.1078 · 10^(7.5t/(237.3+t))`, t in °C.
- **Dew point**: `t_dp = 237.3 · c/(7.5 − c)`, where `c = log₁₀(p_v/6.1078)`.
- **Wet-bulb relation**: `p_v = p_ws,wb − (p·(t − t_wb)/1512)·(1 + 0.00114·t_wb)`; wet-bulb temperature solved iteratively (bisection, 20 iterations).
- **Barometric pressure at altitude** (ISA): `p = 1013.25 · (1 − 2.25577×10⁻⁵·z)^5.25588` mbar.
- **Humidity ratio**: `W = 0.621945 · p_v/(p − p_v)`.
- **Enthalpy**: SI `h = 1.006t + W(2501 + 1.86t)` kJ/kg; IP `h = 0.240t_F + W(1061 + 0.444t_F)` Btu/lb.
- **Specific volume**: `v = 287.055·(t + 273.15)·(1 + 1.6078W)/(p·100)` m³/kg.
- **Interlocked inputs** — relative humidity, wet bulb, and dew point are computed mutually; states above saturation are clamped and flagged.
- **ISHRAE 1.0% peak presets** for six Indian cities (New Delhi, Mumbai, Chennai, Kolkata, Hyderabad, Bengaluru).

### Y-Piece Split Analysis

- **ANS throat size**: `ANS = (Z/X)·A` — branch airflow ÷ main airflow × main duct width; rounded to 0.5 in (IP) or 1 mm (SI).
- Remaining straight-path flow: `Y = X − Z`; face velocities from `V = Q/(W·H/144)` FPM for the main and the S-1 branch (E × F).
- Advisory when the ANS throat exceeds the branch duct width E.

---

## Development & Deployment

**Serving locally**

```bash
python -m http.server 8000
# or any static file server — the suite has no server-side requirements
```

**Continuous deployment**

Pushing to the `master` branch triggers the [GitHub Actions workflow](.github/workflows/static.yml), which publishes the suite to GitHub Pages automatically. The same service worker used online provides full offline functionality for installed clients.

---

*Engineering references: ASHRAE Fundamentals, SMACNA HVAC Systems Duct Design (4th Ed.), ISHRAE design handbooks.*
