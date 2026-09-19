# Medello 2.1 — App Store Review Prototype

Interactive, phone-framed patient chrome for **App Store 2.1** review. Visual system, tokens, type, and copy are adapted from the **ChatGPT Patient & Family** design pack — not a new brand.

## Live link

**https://drharish14-tech.github.io/medello-2.1-prototype/**

### Design compare (corrected)

**https://drharish14-tech.github.io/medello-2.1-prototype/compare.html**

Side-by-side of:

| Column | What it is |
| --- | --- |
| **Old · Daylight + AI orb** | Tend Daylight AI-prominent design — center sparkle/AI orb in the tab bar, Hold to take, Ask AI / Tell Tend AI on Add, AI sparkles beside meds |
| **ChatGPT · Patient & Family** | Labelled 5-tab chrome with **Family**, no center AI orb — the pack this interactive prototype follows |

> Previous compare was wrong (both sides were ChatGPT-derived). This page uses Daylight phone shots from `medello-shots/v2/work/phones/` vs Patient & Family `*-full.png`.

This is **not** “ship vs ChatGPT.” It is **Daylight AI era vs ChatGPT Patient & Family** so chrome deltas (orb → Family, AI CTAs → Log) are visible before locking native.

| Query | Screen |
| --- | --- |
| `/` or `?screen=today` | Today |
| `?screen=medicines` | Meds |
| `?screen=family` | Family stub |
| `?screen=progress` | Progress |
| `?screen=settings` | Settings |
| `?screen=paywall` | Medello Premium |
| `?screen=add` | Add medicine |

## How to update design

1. Edit files in this repo (`index.html`, `app.js`, `styles.css`, `ship.css`, `shots/`).
2. Commit and push to `main`.
3. GitHub Pages rebuilds in ~1–2 minutes — refresh the live link.
4. When the look is locked, tell **Medello** to port the chrome into the native Tend repo (PR) and only then merge / TestFlight.

```bash
git clone https://github.com/drharish14-tech/medello-2.1-prototype.git
cd medello-2.1-prototype
# …edit…
git add -A && git commit -m "design: …" && git push
```

Local preview:

```bash
python3 -m http.server 8777
# open http://127.0.0.1:8777/
```

## In scope (interactive)

- **5-tab chrome:** Today · Meds · Family · Progress · Settings (~390×844) — ChatGPT Patient & Family direction (no center AI orb)
- **Today:** “Your day.” timeline + Log → **Taken / Snooze / Skip** (simulated)
- **Meds:** “Your medicines.” search + condition/all list
- **Family:** stub — “Family & caregivers” / “Your people.” / Alex card; rows open a one-time share sheet mock
- **Progress:** “Your week.” chart + metrics from the source pack
- **Settings:** “Your settings.” → **Medello Premium**
- **Add medicine:** sheet/flow from Today/Meds +
- **Paywall:** MEDELLO PREMIUM, Monthly/Yearly, Terms / Privacy / Restore
- **Reset sample day** toolbar control

## Out of scope (hidden or labeled “Not in 2.1”)

- Full caregiver invite, consent scopes, escalation
- Caregiver dashboard / live sync
- Family Plus purchase beyond the Premium paywall
- Full onboarding redesign (skipped — opens on Today)
- Daylight-era center AI orb, Tell Tend AI / Ask AI CTAs, Hold-to-take (see compare page)

## Design source

Adapted from the ChatGPT Patient & Family design pack (tokens: forest `#123d32`, action `#176249`, canvas `#f5f7f2`, lime `#d7edac`, ink `#19372e`).

Compare “Old” column assets: Tend Daylight AI phone PNGs (`medello-shots/v2/work/phones/`).

Ship-only glue: `ship.css` + `app.js`.

## Screenshots

`shots/today.png` · `shots/family.png` · `shots/paywall.png`

## Notes

- Dose state persists in `localStorage` key `medello-ship21-v1` (this browser only).
- Terms → https://getmedello.com/terms · Privacy → https://getmedello.com/privacy
- Design prototype only — no real checkout, notifications, or backend.
- Native app code lives in `drharish14-tech/Tend` — do **not** merge chrome into TestFlight until this live prototype is locked.
