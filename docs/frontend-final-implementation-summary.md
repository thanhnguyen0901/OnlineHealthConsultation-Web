# Frontend Final Implementation Summary

## Scope

Frontend `OnlineHealthConsultation-Web` has been adapted to the real backend MVP contract from `OnlineHealthConsultation-Service` across public/auth, patient, doctor, admin, reports, and Playwright smoke testing.

Future Enhancement items remain out of scope: real email/SMS, real video call, file upload, rate limiting, advanced audit UI, deep performance/security testing, and full-system pagination.

## Public and Auth

- Added public routes: `/specialties`, `/doctors`, `/doctors/:doctorId`, `/403`.
- Home now uses `/public/home`, `/public/doctors`, and `/public/specialties`.
- Public doctor list/detail show `avgRating` and `ratingCount`.
- Guest book/ask CTA redirects to login with safe return URL handling.
- Register doctor now loads `/public/specialties` and sends `specialtyId`.
- Auth API normalizes direct NestJS responses and wrapped `{ data }` responses.

## Patient

- Patient profile uses `GET/PATCH /patients/me/profile`.
- Appointment booking uses public specialties/doctors and `POST /appointments`.
- Patient history loads separate real endpoints: `/appointments/mine`, `/questions/mine`, `/ratings/mine`.
- Appointment detail uses `GET /appointments/:id`.
- Cancel appointment uses `PATCH /appointments/:id/cancel`.
- Question creation uses `POST /questions` with `{ title, content }`.
- Consultation result/prescription uses `GET /consultations/:appointmentId/result`.
- Rating uses `POST /ratings` with `{ appointmentId, score, comment }`.

## Doctor

- Doctor dashboard/profile use `/doctors/me/profile`.
- Profile update uses `/doctors/me/profile` and `/doctors/me/specialties`.
- Schedule update uses `/doctors/me/schedule`.
- Appointment list uses `/appointments/doctor/me`.
- Confirm/complete use `/appointments/:id/confirm` and `/appointments/:id/complete`.
- Question inbox uses `/questions/assigned`.
- Answer question sends `{ content }` to `/questions/:id/answers`.
- Doctor ratings use `/ratings/doctor/me`.
- Added `/doctor/consultations/:appointmentId` session page with chat fallback, summary, and prescription forms.

## Admin and Reports

- Admin dashboard uses `/reports/dashboard`.
- Reports use `/reports/dashboard` and `/reports/consultations/trend`.
- Users use `GET/POST/PATCH/DELETE /admin/users`.
- Patient management uses `/admin/users?role=PATIENT` and user status deactivate.
- Doctors use `/admin/doctors` and `/admin/doctors/:doctorId/approval`.
- Specialties use `/admin/specialties`, `PATCH`, and deactivate endpoint.
- Appointments use `/admin/appointments` with `status/fromDate/toDate` and `/admin/appointments/:id/status`.
- Unified moderation list is not called because backend does not expose it yet.

## Playwright

- Cypress has been removed from source, scripts, dependency list, and project files.
- Source now uses `data-testid` selectors for Playwright-oriented automation.
- Existing smoke specs cover home, login, register, doctor list, and guest book CTA when doctor data exists.

## Important TODOs

- `TODO_BACKEND_API`: unified admin moderation list endpoint is missing.
- `TODO_BACKEND_API`: doctor patient list endpoint is missing.
- `TODO_BACKEND_API`: admin doctor creation can create a DOCTOR user, but a dedicated admin doctor-profile creation/update endpoint is still needed for full specialty/bio CRUD.
- `TODO_BACKEND_API`: reporting MVP does not expose question chart, top doctors report, or specialty distribution.
- Smoke CTA test skips when backend/test seed has no public doctor cards.

## Validation

Commands actually run:

```bash
npm run build
npm run lint
npm run test:e2e
```

Results:

- `npm run build`: pass. Vite reported non-blocking browserslist and chunk-size warnings.
- `npm run lint`: pass.
- `npm run test:e2e`: pass with 4 passed and 1 skipped because no public doctor data was available for the guest CTA test.
