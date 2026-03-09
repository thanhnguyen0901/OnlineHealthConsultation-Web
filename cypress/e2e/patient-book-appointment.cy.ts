// cypress/e2e/patient-book-appointment.cy.ts
// Tests for the Book Appointment feature.
//
// NOTE on PrimeReact Dropdown interactions:
// Cypress cannot use .select() on PrimeReact Dropdowns (they are not native <select>).
// The pattern is: click the wrapper div[id="<name>"], wait for the panel, then click
// the target option in the overlay list.  If PrimeReact renders the #name id on the
// trigger element, target that; otherwise use the label wrapper.
//
// The tests stub all API calls — no real backend required.

describe('Patient – Book Appointment', () => {
  const selectPrimeDropdown = (fieldId: string, optionText: string | RegExp) => {
    // Click the PrimeReact Dropdown trigger element (id is set to the Formik field name).
    cy.get(`#${fieldId}`).click();
    // The overlay panel uses .p-dropdown-items; wait for it to appear, then click the item.
    cy.get('.p-dropdown-item').contains(optionText).click();
  };

  beforeEach(() => {
    cy.fixture('specialties').then((specialties) => {
      cy.intercept('GET', '**/patients/specialties', {
        statusCode: 200,
        body: { data: specialties },
      }).as('loadSpecialties');
    });

    cy.loginAs('PATIENT', '/patient/book-appointment');
    cy.wait('@loadSpecialties');
  });

  it('renders the booking form with required fields', () => {
    cy.contains('h1', /book/i).should('be.visible');
    cy.get('#specialtyId').should('exist');
    cy.get('#doctorId').should('exist');
    cy.get('#time').should('exist');
    cy.get('[data-cy="book-appointment-submit"]').should('be.visible');
  });

  it('shows validation errors when submitted empty', () => {
    cy.get('[data-cy="book-appointment-submit"]').click();
    // Each empty required field gets a validation small element.
    cy.get('.p-error, small.text-red-500').should('have.length.at.least', 3);
  });

  it('loads doctors when a specialty is selected', () => {
    cy.fixture('users').then((users) => {
      cy.intercept('GET', '**/patients/doctors?specialtyId=specialty-001', {
        statusCode: 200,
        body: {
          data: [
            {
              id: users.doctor.id,
              firstName: users.doctor.firstName,
              lastName: users.doctor.lastName,
              email: users.doctor.email,
              role: 'DOCTOR',
              specialtyId: 'specialty-001',
              specialtyName: 'Cardiology',
              isActive: true,
            },
          ],
        },
      }).as('loadDoctors');

      selectPrimeDropdown('specialtyId', 'Cardiology');
      cy.wait('@loadDoctors');

      // Doctor dropdown should now be enabled.
      cy.get('#doctorId').should('not.have.class', 'p-disabled');
    });
  });

  it('submits booking form and redirects to history', () => {
    cy.fixture('users').then((users) => {
      // Stub loading doctors for specialty-001.
      cy.intercept('GET', '**/patients/doctors?specialtyId=specialty-001', {
        statusCode: 200,
        body: {
          data: [
            {
              id: users.doctor.id,
              firstName: users.doctor.firstName,
              lastName: users.doctor.lastName,
              email: users.doctor.email,
              role: 'DOCTOR',
              specialtyId: 'specialty-001',
              specialtyName: 'Cardiology',
              isActive: true,
            },
          ],
        },
      }).as('loadDoctors');

      cy.intercept('POST', '**/patients/appointments', {
        statusCode: 201,
        body: {
          data: {
            id: 'appt-new',
            patientId: 'patient-001',
            doctorId: users.doctor.id,
            doctorName: users.doctor.name,
            specialtyId: 'specialty-001',
            specialtyName: 'Cardiology',
            date: '2026-03-20',
            time: '09:00',
            status: 'pending',
            reason: 'Annual check-up',
          },
        },
      }).as('bookAppointment');

      cy.intercept('GET', '**/patients/history', {
        statusCode: 200,
        body: { data: { questions: [], appointments: [] } },
      }).as('loadHistory');

      // Step 1: Select specialty
      selectPrimeDropdown('specialtyId', 'Cardiology');
      cy.wait('@loadDoctors');

      // Step 2: Select doctor
      selectPrimeDropdown('doctorId', users.doctor.name);

      // Step 3: Pick a date using the PrimeReact Calendar button (next available day).
      // We type the date directly into the underlying input rather than using the date picker UI.
      cy.get('#date').click();
      cy.get('.p-datepicker').should('be.visible');
      // Click the first available (not disabled) day cell.
      cy.get('.p-datepicker-calendar td:not(.p-datepicker-other-month) span:not(.p-disabled)')
        .first()
        .click();

      // Step 4: Select time slot
      selectPrimeDropdown('time', '09:00');

      // Step 5: Fill in reason
      cy.get('#reason').type('Annual check-up');

      cy.get('[data-cy="book-appointment-submit"]').click();
      cy.wait('@bookAppointment');

      cy.url().should('include', '/patient/history');
    });
  });
});
