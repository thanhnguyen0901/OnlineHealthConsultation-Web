# FE-BE Integration Recheck Summary

## Checklist Summary

- Created detailed checklist: `docs/fe-be-integration-recheck-checklist.md`.
- Rechecked backend controllers, DTOs, services, Prisma schema, backend MVP docs, frontend API adapters, routes, guards, Playwright config, and frontend integration docs.
- Scope covered public/auth, patient, doctor, admin, reports, and Playwright readiness for final MVP.

## Issues Found

| Priority | Issue | Impact |
|---|---|---|
| P0 | Admin dashboard used `data-testid="admin-dashboard"` while Playwright readiness checklist required `admin-dashboard-page`. | E2E selectors could drift from the agreed contract. |
| P0 | Admin user create UI exposed `ADMIN`, but backend `POST /admin/users` only allows `PATIENT` or `DOCTOR`. | Admin user creation could submit a backend-rejected payload. |
| P1 | Admin user edit sent `role` in PATCH payload, but backend `AdminUpdateUserDto` only accepts `email`, `firstName`, `lastName`, `isActive`. | Backend whitelist would strip it, but UI suggested an unsupported edit. |
| P1 | Admin question moderation helper sent `APPROVE/REJECT`; backend service explicitly handles `CLOSE`, `REOPEN`, otherwise `MODERATED`. | Future moderation-list wiring would produce unclear actions. |

## Issues Fixed

- Changed Admin dashboard selector to `admin-dashboard-page`.
- Removed `ADMIN` from Admin user create role options.
- Hid role selector when editing an existing user.
- Removed `role` from Admin user PATCH payload and dirty-check logic.
- Changed question moderation helper:
  - approve -> `REOPEN`
  - reject/hide -> `MODERATE`

## Issues Left as Future Enhancement

- Unified `GET /api/admin/moderation` list endpoint is still missing; current FE route keeps an empty state with `TODO_BACKEND_API`.
- Dedicated doctor patient list endpoint is still missing; doctor patients page keeps an empty state with `TODO_BACKEND_API`.
- Dedicated admin doctor-profile create/update endpoint for richer specialty/bio CRUD is still missing.
- Reporting endpoints for question status chart, top doctors, and specialty distribution are not in backend MVP; FE keeps documented fallback/empty data.
- Direct patient/doctor appointment detail routes can be added later if deep linking is required; current MVP uses detail dialogs.

## Files Changed

- `docs/fe-be-integration-recheck-checklist.md`
- `docs/fe-be-integration-recheck-summary.md`
- `src/features/admin/apis/admin.api.ts`
- `src/features/admin/pages/AdminDashboardPage.tsx`
- `src/features/admin/pages/UsersManagePage.tsx`

## API Contract Final

- Public APIs use `/api/public/home`, `/api/public/specialties`, `/api/public/doctors`, `/api/public/doctors/:doctorId`.
- Auth uses `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh`, `/api/auth/logout`, `/api/auth/me`.
- Patient flows use `/api/patients/me/profile`, `/api/appointments`, `/api/appointments/mine`, `/api/appointments/:id`, `/api/questions`, `/api/questions/mine`, `/api/consultations/:appointmentId/result`, `/api/ratings`, `/api/ratings/mine`.
- Doctor flows use `/api/doctors/me/profile`, `/api/doctors/me/schedule`, `/api/doctors/me/specialties`, `/api/appointments/doctor/me`, `/api/questions/assigned`, `/api/questions/:id/answers`, consultation session endpoints, and `/api/ratings/doctor/me`.
- Admin flows use `/api/reports/dashboard`, `/api/reports/consultations/trend`, `/api/admin/users`, `/api/admin/doctors`, `/api/admin/specialties`, `/api/admin/appointments`, question/rating moderation actions.

## Routes Final

- Public: `/`, `/specialties`, `/doctors`, `/doctors/:doctorId`, `/login`, `/register`, `/403`.
- Patient: `/patient`, `/patient/profile`, `/patient/book-appointment`, `/patient/history`, `/patient/ask-question`.
- Doctor: `/doctor`, `/doctor/profile`, `/doctor/appointments`, `/doctor/inbox`, `/doctor/consultations/:appointmentId`, `/doctor/ratings`, `/doctor/schedule`, `/doctor/patients`.
- Admin: `/admin`, `/admin/users`, `/admin/patients`, `/admin/doctors`, `/admin/specialties`, `/admin/appointments`, `/admin/moderation`, `/reports`.

## data-testid Final

P0 selectors verified or fixed:

- `home-page`
- `doctor-list-page`
- `doctor-card-{id}`
- `doctor-detail-page`
- `book-appointment-guest`
- `login-page`
- `register-page`
- `patient-dashboard-page`
- `appointment-create-page`
- `appointment-list-page`
- `question-create-page`
- `doctor-dashboard-page`
- `doctor-question-list-page`
- `doctor-answer-form`
- `admin-dashboard-page`
- `admin-doctor-list-page`
- `forbidden-page`
- `loading-state`
- `empty-state`
- `error-alert`

## Build, Lint, Test Results

Frontend commands actually run:

```bash
npm run build
npm run lint
npm run test:e2e
```

Frontend results:

- `npm run build`: pass. Non-blocking warnings: browserslist data old, chunk size warning.
- `npm run lint`: pass.
- `npm run test:e2e`: pass with 4 passed and 1 skipped. The skipped test is the guest book CTA case when current backend/test data has no public doctor card.

Backend commands actually run:

```bash
npm run build
npm test
```

Backend results:

- `npm run build`: pass.
- `npm test`: pass by current Jest config with `--passWithNoTests`; output says `No tests found, exiting with code 0`.

## Risks Remaining

- Playwright smoke coverage is still public/auth-only; patient/doctor/admin role flows need seeded backend data.
- Report/demo completeness depends on seed data containing approved active doctors, specialties, appointments, questions, consultation sessions, prescriptions, and ratings.
- Admin moderation screen is limited until backend provides a unified moderation list endpoint.

## Next Step

Write Playwright E2E tests for seeded real flows:

- Auth login by role.
- Public doctor discovery and guest CTA.
- Patient booking/question/history/result/rating.
- Doctor appointment/question/summary/prescription.
- Admin doctor approval and core management screens.
