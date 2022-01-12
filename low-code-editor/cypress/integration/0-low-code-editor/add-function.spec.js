/// <reference types="cypress" />


describe('add function to a file', () => {
    beforeEach(() => {
      cy.visit('http://localhost:6006/iframe.html?id=low-code-editor-development-project--empty-bal&args=')
    })
  
    it('Displays add construct message', () => {
        cy.get('#Get_started_by_selecting_Add_Constructor_here', { timeout: 6000 })
            .find('tspan')
            .should('have.text', 'Click here to get started.')
        cy.get('#Top_plus')
            .click()
            .get(".options-wrapper")
            .contains("Function")
            .click()
            .get('[data-testid="function-form"]')
            .get('.view-lines')
            .first()
            .type('myfunction')
            .get('button')
            .contains("Save")
            .click()
    })

  })
  