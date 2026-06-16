# Test Seed Requirements

## Current Status

Backend E2E seed data has been implemented in `OnlineHealthConsultation-Service/prisma/seed-e2e.ts`.

The Playwright suite no longer skips core workflow tests because of missing patient, doctor, admin, appointment, question, consultation, prescription, rating, or disposable specialty seed data.

Latest validated run:

- 37 tests discovered.
- 36 passed.
- 1 skipped/fixme.
- 0 failed.

Remaining skipped/fixme:

- E2E-023: Doctor unauthorized question direct route. This is not a seed-data gap. The current frontend MVP has no direct question detail route/API for this negative test.

## Seed Command

Run from backend:

```bash
cd OnlineHealthConsultation-Service
source ~/.nvm/nvm.sh
npm run prisma:migrate:deploy
npm run db:seed:e2e
```

The seed script is idempotent for the current E2E records and prints the env values needed by Playwright.

## Accounts

| Role | Email | Password | Requirement |
|---|---|---|---|
| Admin | `admin@healthcare.local` | `Admin@123` | Active admin user |
| Patient | `patient.e2e@healthcare.local` | `Patient@123` | Active patient user with profile |
| Other patient | `patient.other.e2e@healthcare.local` | `Patient@123` | Ownership negative data |
| Doctor | `doctor.e2e@healthcare.local` | `Doctor@123` | Active, approved doctor profile with specialties |
| Pending doctor | `doctor.pending.e2e@healthcare.local` | `Doctor@123` | Pending doctor profile for admin approval |
| Other doctor | `doctor.other.e2e@healthcare.local` | `Doctor@123` | Ownership negative data |

## Domain Data

Seeded records include:

- Active E2E specialties.
- Approved public doctor profile with schedule and rating summary.
- Pending doctor profile for admin approval.
- Patient profiles.
- Future pending appointment.
- Confirmed appointment.
- Completed appointment.
- Disposable cancellable appointment.
- Pending question assigned/open for doctor answer.
- Answered question for patient history.
- Consultation session linked to completed/workflow appointments.
- Consultation messages.
- Consultation summary.
- Prescription and prescription item.
- Visible rating after completed appointment.
- Disposable specialty data for admin CRUD mutation flow.

## Playwright Env

Use these values for the validated seeded run:

```bash
E2E_RUN_SEEDED=true
E2E_PATIENT_EMAIL=patient.e2e@healthcare.local
E2E_PATIENT_PASSWORD=Patient@123
E2E_DOCTOR_EMAIL=doctor.e2e@healthcare.local
E2E_DOCTOR_PASSWORD=Doctor@123
E2E_ADMIN_EMAIL=admin@healthcare.local
E2E_ADMIN_PASSWORD=Admin@123
E2E_APPROVED_DOCTOR_EMAIL=doctor.e2e@healthcare.local
E2E_PENDING_DOCTOR_EMAIL=doctor.pending.e2e@healthcare.local
E2E_APPROVED_DOCTOR_ID=019ed085-9bb9-7a83-bdee-b3b266b827b8
E2E_PENDING_DOCTOR_ID=019ed085-9bb9-7a83-bdee-b3b35ffc1f61
E2E_APPOINTMENT_ID=019ed085-9bc5-7ee1-aeb6-93edb9a2e3ce
E2E_CONFIRMED_APPOINTMENT_ID=019ed085-9bc7-7925-9834-cedf831db8df
E2E_COMPLETED_APPOINTMENT_ID=019ed085-9bca-78ba-b82b-f11d937b337c
E2E_CONSULTATION_APPOINTMENT_ID=019ed085-9bcc-76ff-91ae-fa05ce14721d
E2E_CANCELLABLE_APPOINTMENT_ID=019ed085-9bc9-76a1-b3d0-7f6a3899cc0b
E2E_DOCTOR_SEARCH_KEYWORD=cardiology
E2E_SPECIALTY_NAME=E2E Cardiology
VITE_API_BASE_URL=http://localhost:4000
E2E_API_BASE_URL=http://localhost:4000
PLAYWRIGHT_BASE_URL=http://localhost:5173
```

## Safe Mutation Notes

- Rerun `npm run db:seed:e2e` before a full suite when tests mutate appointment, pending doctor, question, or specialty state.
- The seed uses E2E-owned deterministic emails/names/IDs and avoids deleting non-E2E data.
- Patient cancel, doctor confirm/complete, doctor answer question, admin doctor approval, and admin specialty CRUD use seeded disposable or resettable data.
