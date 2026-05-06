# Net Recovery Engine + FMV Module MVP

This is a Vite + React prototype that upgrades the original Net Recovery Engine front-end into an FMV-enabled module.

## What changed

- Added FMV calculation engine inside `src/main.jsx`
- Added relevance-weighted comp anchor
- Added editable comparable sales list
- Added include/exclude comp logic
- Added condition, configuration, usage, and region multipliers
- Added FMV range and listing price
- Added confidence score
- Added repair ROI and channel recommendation integration
- Added customer-ready FMV report tab
- Added print/PDF-friendly report behavior

## Run locally

```bash
npm install
npm run dev
```

Open the Vite URL shown in your terminal.

## Notes

This is still a front-end prototype using local sample data. To connect it to a live NRE / ASSETFAX system, wire the asset, inspection, condition, repair, comp, channel, and report data to your backend/API.

