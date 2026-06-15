# Test Seed Requirements

The current backend `prisma/seed.ts` creates:

- `admin@healthcare.local` / `Admin@123`
- Active specialties: `General Medicine`, `Cardiology`

To run the full Playwright E2E suite without skips, add or prepare the following records in the backend database.

## Accounts

| Role | Env variable | Requirement |
|---|---|---|
| Patient | `E2E_PATIENT_EMAIL`, `E2E_PATIENT_PASSWORD` | Active patient user with patient profile |
| Doctor | `E2E_DOCTOR_EMAIL`, `E2E_DOCTOR_PASSWORD` | Active doctor user, approved doctor profile, linked active specialty |
| Admin | `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD` | Active admin user; default seed works |

## Public Discovery Data

- At least one doctor profile with:
  - `approvalStatus = APPROVED`
  - `isActive = true`
  - linked active user
  - linked active specialty
- Optional visible rating for rating summary display.

## Appointment Data

Recommended env values:

- `E2E_APPOINTMENT_ID`: patient-owned appointment visible in patient history.
- `E2E_CONFIRMED_APPOINTMENT_ID`: confirmed appointment assigned to the doctor.
- `E2E_COMPLETED_APPOINTMENT_ID`: completed appointment for result/rating.
- `E2E_CONSULTATION_APPOINTMENT_ID`: appointment that can start/join consultation session.

## Question Data

- At least one pending/open question assigned to the E2E doctor for answer workflow.
- At least one answered question for patient answer-view workflow.

## Consultation and Prescription Data

- Consultation session linked to a completed appointment.
- Summary present for result view.
- Prescription with at least one item for prescription rendering test.

## Safe Mutation Notes

- Appointment cancel, specialty deactivate, and doctor approve/reject mutate shared state.
- For CI, seed disposable records or reset the database before each run.
- Tests that mutate shared data are marked skip/fixme unless explicit seed IDs are provided.
