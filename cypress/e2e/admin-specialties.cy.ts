// cypress/e2e/admin-specialties.cy.ts
// CRUD tests for the Admin – Manage Specialties page.
//
// UI pattern: PrimeReact DataTable + Dialog.
// The "Add" and "Edit" dialogs are PrimeReact <Dialog> portals with <InputText> fields
// and an "action" Button.  The "Delete" confirmation dialog appears on the trash icon click.

describe('Admin – Manage Specialties', () => {
  beforeEach(() => {
    cy.fixture('specialties').then((specialties) => {
      cy.intercept('GET', '**/api/admin/specialties', {
        statusCode: 200,
        body: { data: specialties },
      }).as('loadSpecialties');
    });

    cy.loginAs('ADMIN', '/admin/specialties');
    cy.wait('@loadSpecialties');
  });

  it('renders the specialties table with rows from the fixture', () => {
    cy.contains('td', 'Cardiology').should('be.visible');
    cy.contains('td', 'Dermatology').should('be.visible');
    cy.contains('td', 'Neurology').should('be.visible');
  });

  it('opens the Create Specialty dialog when "New" is clicked', () => {
    // The "New" / "Add" button is an admin Button rendered above the DataTable.
    cy.get('[data-cy="btn-new-specialty"]').click();
    // PrimeReact Dialog is appended to the body.
    cy.get('.p-dialog').should('be.visible');
    // Dialog contains the nameEn and nameVi input fields.
    cy.get('.p-dialog input[id="nameEn"]').should('be.visible');
    cy.get('.p-dialog input[id="nameVi"]').should('be.visible');
  });

  it('creates a new specialty successfully', () => {
    cy.fixture('specialties').then((specialties) => {
      const newSpecialty = {
        id: 'specialty-new',
        nameEn: 'Oncology',
        nameVi: 'Ung bướu',
        description: 'Cancer treatment',
        isActive: true,
      };

      cy.intercept('POST', '**/api/admin/specialties', {
        statusCode: 201,
        body: { data: newSpecialty },
      }).as('createSpecialty');

      // Refresh list after create
      cy.intercept('GET', '**/api/admin/specialties', {
        statusCode: 200,
        body: { data: [...specialties, newSpecialty] },
      }).as('reloadSpecialties');

      cy.get('[data-cy="btn-new-specialty"]').click();
      cy.get('.p-dialog input[id="nameEn"]').type('Oncology');
      cy.get('.p-dialog input[id="nameVi"]').type('Ung bướu');
      cy.get('.p-dialog textarea[id="description"]').type('Cancer treatment');

      // Click the Save / action button inside the dialog footer.
      cy.get('.p-dialog-footer [data-cy="btn-save-specialty"]').click();
      cy.wait('@createSpecialty');
    });
  });

  it('shows validation errors when saving an empty specialty', () => {
    cy.get('[data-cy="btn-new-specialty"]').click();
    cy.get('.p-dialog-footer [data-cy="btn-save-specialty"]').click();

    // SpecialtiesManagePage sets `submitted=true` on save; error text appears next to empty fields.
    cy.get('.p-dialog')
      .contains(/required|name/i)
      .should('be.visible');
  });

  it('opens the edit dialog with pre-filled values', () => {
    // Each row has an edit icon button.
    cy.get('[data-cy="btn-edit-specialty-specialty-001"]').click();
    cy.get('.p-dialog input[id="nameEn"]').should('have.value', 'Cardiology');
    cy.get('.p-dialog input[id="nameVi"]').should('have.value', 'Tim mạch');
  });

  it('updates a specialty successfully', () => {
    cy.intercept('PUT', '**/api/admin/specialties/specialty-001', {
      statusCode: 200,
      body: {
        data: {
          id: 'specialty-001',
          nameEn: 'Cardiology Updated',
          nameVi: 'Tim mạch (cập nhật)',
          isActive: true,
        },
      },
    }).as('updateSpecialty');

    cy.get('[data-cy="btn-edit-specialty-specialty-001"]').click();
    cy.get('.p-dialog input[id="nameEn"]').clear().type('Cardiology Updated');
    cy.get('.p-dialog-footer [data-cy="btn-save-specialty"]').click();
    cy.wait('@updateSpecialty');
  });

  it('opens the delete confirmation dialog', () => {
    cy.get('[data-cy="btn-delete-specialty-specialty-001"]').click();
    // PrimeReact Dialog opens; expect the confirm-delete button in the footer.
    cy.get('[data-cy="btn-confirm-delete"]').should('be.visible');
  });

  it('deletes a specialty successfully', () => {
    cy.intercept('DELETE', '**/api/admin/specialties/specialty-001', {
      statusCode: 200,
      body: {},
    }).as('deleteSpecialty');

    cy.get('[data-cy="btn-delete-specialty-specialty-001"]').click();
    // Click the primary Delete button in the confirmation dialog.
    cy.get('.p-dialog-footer [data-cy="btn-confirm-delete"]').click();
    cy.wait('@deleteSpecialty');
  });
});
