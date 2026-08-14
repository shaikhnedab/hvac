# HVAC Design Suite

A collection of quick engineering utilities for HVAC design — installed as an installable offline-first web app (PWA). No build tools, no dependencies: plain HTML/CSS/JS.

**Live demo:** https://shaikhnedab.github.io/hvac/

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

## Deployment

The included [GitHub Actions workflow](.github/workflows/static.yml) auto-deploys the `master` branch to GitHub Pages.

## Tech

Plain HTML / CSS / JavaScript — open the files directly or serve the folder (`python -m http.server 8000`). No frameworks, no build step.
