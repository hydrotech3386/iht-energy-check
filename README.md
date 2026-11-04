# Energy Check app

Mobile web app for collecting Grundfos Energy Optimization site data and photos.
Based on the paper "Energy Check - Site Data Collection Form".

## How it works

- Every user signs in with their **Project Management login**. All approved users see and edit the same visits.
- **Customer → Project → Visit → Pump.** The home screen groups projects by customer. A project holds visits on different days, and also lists its pumps by location. Each pump has five tabs: Pump, Motor, Electrical, System, Notes.
- Works with no signal once signed in. Everything saves to the phone first, then syncs when there is signal. The status at the top shows Synced, Syncing or Offline with a waiting count.
- **Export** works for one visit or a whole project. It gives a PDF (the form plus photo pages) and a ZIP (PDF, full-size photos in a folder per pump, `data.json`).

## Accounts

- New accounts start with no access. An admin gives them a role in Project Management, under Users. Any role allows Energy Check.
- Everyone approved can view and export everything, start a project and start their own visit.
- A visit, with its pumps and photos, can only be changed or deleted by an **admin**, an **EO Coordinator** or the **person conducting it**.
- Whoever starts a visit conducts it. Only an admin or EO Coordinator can change the conductor.
- Project details can be changed by an admin, an EO Coordinator or the project's creator.
- `database.rules.json` enforces this on the server. Photo files in Storage only check for a signed-in user, because Storage rules cannot read the database. The app checks this before uploading.

## Where data lives

Firebase project `iht-project-schedule`, shared with Project Management:

| What | Where |
|---|---|
| Visits, pumps, photo records | Realtime Database `pm/energyCheck/{projects,visits,pumps,photos}` |
| Photos | Storage `pm/energyCheck/{visitId}/{photoId}.jpg` |
| Users and roles | `pm/users` (Project Management's table) |

Rules are in the Project Management repo: `database.rules.json` and `storage.rules`. Deploy from there:

```bash
./tooling/node_modules/.bin/firebase deploy --only database,storage --project iht-project-schedule
```

## How sync behaves

- Only changed fields are sent, so two people editing different fields of a pump both keep their work. If both change the same field, the last to sync wins.
- Visits made before projects existed move automatically into one project per customer, with the id `legacy-<customer>`.
- Deletes leave a `deleted: true` marker, so a phone that was offline cannot bring the record back.
- Uploaded photos stay on the phone for 30 days, then load from the cloud when viewed.
- Signing out clears the phone, and is refused while anything is waiting to sync.

## Reading nameplates with AI

A new pump or motor plate photo goes to the `readNameplate` Cloud Function, in the Project Management repo. It uses Claude and the API key in Secret Manager, so the key never reaches the phone. The reading opens beside the photo to be corrected, and nothing reaches the form until **Apply**. With no signal the photo is kept and **Read nameplate with AI** can be tapped later.

## Photos required

Marked "Photo needed" in the app and listed under "Still missing". They never block an export.

- **Mechanical:** location/room, pump, piping, suction gauge, discharge gauge, valve throttle (not needed if "throttled" is No), pump plate, motor plate, negative or positive suction.
- **Electrical:** starter (not needed if the starting method is Inverter), amp from site, amp from clamp meter, voltage all phases, inverter with running Hz (inverter only).
- **Optional:** flow reading, medium viscosity/density/temperature, chemical mixed, other.

## Fields added beyond the paper form

Quantity of identical pumps, rated voltage and current, running days/week, pump installation year, tariff, amps L1/L2/L3 (averaged into
Motor Amp Measured), site panel amp, volts L1/L2/L3, temperature, density, viscosity, chemical mixed.

## On-site check

Calculated for water only, to catch a bad reading before leaving site:

- Head (m) = (discharge - suction) bar x 10.2. With no suction reading and negative suction: discharge x 10.2 + static lift.
- Hydraulic power (kW) = flow (m3/h) x head (m) / 367.
- Phase imbalance = largest deviation from the average current. Flagged above 5%.

## Calculated fields

- Running hours/year = hours/day x days/week x 365 / 7. 24/7 gives 8,760.
- Pump age = the visit's year minus the installation year, so an old visit's record does not change later.
- Pumps saved earlier keep their typed days/year and age until someone fills in the new fields.

## Editing the checklist

`F` (fields), `SLOTS` (photos) and `STEPS` (tabs) at the top of the script in `index.html` drive the form and the
missing list. `drawForm` lays out the PDF. Add new files to `ASSETS` in `sw.js`.

## Limits

- First sign-in on a phone needs signal.
- Photos taken by other users load from the cloud, so they cannot be viewed with no signal.
- Until a phone syncs, its work exists only on that phone. iPhone Safari can clear data for a site not used for 7 days unless it is added to the Home Screen.
- `vendor/` holds jsPDF 2.5.2, JSZip 3.10.1 and Firebase 10.14.1 so that the app opens offline.
- The AI reader needs signal.
