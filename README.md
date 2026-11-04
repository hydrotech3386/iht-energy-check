# Energy Check app

Mobile web app for collecting Grundfos Energy Optimization site data and photos.
Based on the paper "Energy Check - Site Data Collection Form".

## How it works

- Every user signs in with their **Project Management login**. All approved users see and edit the same visits.
- One **site visit** holds many **pumps**. Each pump has five tabs: Pump, Motor, Electrical, System, Notes.
- Works with no signal once signed in. Everything saves to the phone first, then syncs when there is signal. The status at the top shows Synced, Syncing or Offline with a waiting count.
- **Export** gives a PDF (the form plus photo pages) and a ZIP (PDF, full-size photos in a folder per pump, `data.json`).

## Accounts

- New accounts start with no access. An admin gives them a role in Project Management, under Users. Any role allows Energy Check.
- Anyone approved can edit anything. Deleting is limited to whoever created the record, or an admin.

## Where data lives

Firebase project `iht-project-schedule`, shared with Project Management:

| What | Where |
|---|---|
| Visits, pumps, photo records | Realtime Database `pm/energyCheck/{visits,pumps,photos}` |
| Photos | Storage `pm/energyCheck/{visitId}/{photoId}.jpg` |
| Users and roles | `pm/users` (Project Management's table) |

Rules are in the Project Management repo: `database.rules.json` and `storage.rules`. Deploy from there:

```bash
./tooling/node_modules/.bin/firebase deploy --only database,storage --project iht-project-schedule
```

## How sync behaves

- Only changed fields are sent, so two people editing different fields of a pump both keep their work. If both change the same field, the last to sync wins.
- Deletes leave a `deleted: true` marker, so a phone that was offline cannot bring the record back.
- Uploaded photos stay on the phone for 30 days, then load from the cloud when viewed.
- Signing out clears the phone, and is refused while anything is waiting to sync.

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

- First sign-in on a phone needs signal.
- Photos taken by other users load from the cloud, so they cannot be viewed with no signal.
- Until a phone syncs, its work exists only on that phone. iPhone Safari can clear data for a site not used for 7 days unless it is added to the Home Screen.
- `vendor/` holds jsPDF 2.5.2, JSZip 3.10.1 and Firebase 10.14.1 so that the app opens offline.
