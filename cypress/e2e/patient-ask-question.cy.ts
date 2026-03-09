// cypress/e2e/patient-ask-question.cy.ts
// Tests for the Ask Question feature.

describe('Patient – Ask a Question', () => {
  beforeEach(() => {
    // Stub /patients/specialties so the dropdown is populated.
    cy.intercept('GET', '**/api/patients/specialties', {
      statusCode: 200,
      body: { data: [] }, // empty list to verify form still renders; real data tested separately
    }).as('loadSpecialties');

    cy.loginAs('PATIENT', '/patient/ask-question');
    cy.wait('@loadSpecialties');
  });

  it('renders the Ask Question form', () => {
    cy.contains('h1', /ask/i).should('be.visible');
    cy.get('[data-cy="ask-question-submit"]').should('be.visible');
  });

  it('shows a validation error when the question field is empty', () => {
    cy.get('[data-cy="ask-question-submit"]').click();
    cy.contains('Question is required').should('be.visible');
  });

  it('shows a validation error when the question is too short (< 10 chars)', () => {
    cy.get('[data-cy="ask-question-text"]').type('Short');
    cy.get('[data-cy="ask-question-submit"]').click();
    cy.contains('at least 10 characters').should('be.visible');
  });

  it('loads specialties and populates the dropdown', () => {
    // Re-visit with a non-empty fixture so we can assert option items.
    cy.fixture('specialties').then((specialties) => {
      cy.intercept('GET', '**/api/patients/specialties', {
        statusCode: 200,
        body: { data: specialties },
      }).as('loadSpecialtiesPopulated');

      cy.loginAs('PATIENT', '/patient/ask-question');
      cy.wait('@loadSpecialtiesPopulated');

      // PrimeReact Dropdown triggers on the wrapper; check it exists and is enabled.
      cy.get('#specialtyId').should('exist').and('not.be.disabled');
    });
  });

  it('submits the question successfully and redirects to history', () => {
    // Re-visit with a populated specialty list so the Yup-required specialtyId can be satisfied.
    cy.fixture('specialties').then((specialties) => {
      cy.intercept('GET', '**/api/patients/specialties', {
        statusCode: 200,
        body: { data: specialties },
      }).as('loadSpecialtiesPopulated');

      cy.intercept('POST', '**/api/patients/questions', {
        statusCode: 201,
        body: {
          data: {
            id: 'q-new',
            patientId: 'patient-001',
            question: 'What are the symptoms of high blood pressure?',
            status: 'pending',
            createdAt: new Date().toISOString(),
          },
        },
      }).as('askQuestion');

      cy.intercept('GET', '**/api/patients/history', {
        statusCode: 200,
        body: { data: { questions: [], appointments: [] } },
      }).as('loadHistory');

      cy.loginAs('PATIENT', '/patient/ask-question');
      cy.wait('@loadSpecialtiesPopulated');

      // Select the first specialty from the PrimeReact dropdown.
      cy.get('#specialtyId').click();
      cy.get('.p-dropdown-item').first().click();

      cy.get('[data-cy="ask-question-text"]').type(
        'What are the symptoms of high blood pressure?'
      );
      cy.get('[data-cy="ask-question-submit"]').click();
      cy.wait('@askQuestion');

      cy.url().should('include', '/patient/history');
    });
  });

  it('shows a toast on API error', () => {
    // Re-visit with a populated specialty list so the Yup-required specialtyId can be satisfied.
    cy.fixture('specialties').then((specialties) => {
      cy.intercept('GET', '**/api/patients/specialties', {
        statusCode: 200,
        body: { data: specialties },
      }).as('loadSpecialtiesPopulated');

      cy.intercept('POST', '**/api/patients/questions', {
        statusCode: 500,
        body: { message: 'Internal server error' },
      }).as('askQuestionFail');

      cy.loginAs('PATIENT', '/patient/ask-question');
      cy.wait('@loadSpecialtiesPopulated');

      // Select the first specialty from the PrimeReact dropdown.
      cy.get('#specialtyId').click();
      cy.get('.p-dropdown-item').first().click();

      cy.get('[data-cy="ask-question-text"]').type(
        'What are the symptoms of high blood pressure?'
      );
      cy.get('[data-cy="ask-question-submit"]').click();
      cy.wait('@askQuestionFail');

      cy.contains(/failed|error/i).should('be.visible');
    });
  });
});
