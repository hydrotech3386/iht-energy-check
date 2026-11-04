# Energy Check app

Mobile web app for collecting Grundfos Energy Optimization site data and photos.
Based on the paper "Energy Check - Site Data Collection Form".

## How it works

- One **site visit** holds many **pumps**. Each pump has five tabs: Pump, Motor, Electrical, System, Notes.
- Works with no signal once it has been opened online. Everything autosaves to the phone.
- **Export** gives a PDF (the form plus photo pages) and a ZIP (PDF, full-size photos in a folder per pump, `data.json`).
- **Restore a visit from ZIP** on the home screen brings an exported visit back onto any phone.

There is no login and no server. Data leaves the phone only when the user exports it.

## Photos required

Marked "Photo needed" in the app and listed under "Still missing". They never block an export.

- **Mechanical:** location/room, pump, piping, suction gauge, discharge gauge, valve throttle (not needed if "throttled" is No), pump plate, motor plate, negative or positive suction.
- **Electrical:** starter (not needed if the starting method is Inverter), amp from site, amp from clamp meter, voltage all phases, inverter with running Hz (inverter only).
- **Optional:** flow reading, medium viscosity/density/temperature, chemical mixed, other.

## Fields added beyond the paper form

Quantity of identical pumps, rated voltage and current, running days/year, tariff, amps L1/L2/L3 (averaged into
Motor Amp Measured), site panel amp, volts L1/L2/L3, temperature, density, viscosity, chemical mixed.

## On-site check

Calculated for water only, to catch a bad reading before leaving site:

- Head (m) = (discharge - suction) bar x 10.2. With no suction reading and negative suction: discharge x 10.2 + static lift.
- Hydraulic power (kW) = flow (m3/h) x head (m) / 367.
- Phase imbalance = largest deviation from the average current. Flagged above 5%.

## Editing the checklist

`F` (fields), `SLOTS` (photos) and `STEPS` (tabs) at the top of the script in `index.html` drive the form and the
missing list. `drawForm` lays out the PDF. Add new files to `ASSETS` in `sw.js`.

## Limits

- iPhone Safari can clear data for a site not used for 7 days unless it is added to the Home Screen. Export when each visit is done.
- `vendor/` holds jsPDF 2.5.2 and JSZip 3.10.1 so that export works offline.
