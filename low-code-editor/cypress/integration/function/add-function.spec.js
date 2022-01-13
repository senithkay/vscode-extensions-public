/// <reference types="cypress" />

const { getIntegrationTestStoryURL } = require("../../utils/story-url-utils")

const BAL_FILE_PATH = "function/add-function-to-empty-file.bal";

describe('add function to an empty file', () => {
    beforeEach(() => {
      cy.visit(getIntegrationTestStoryURL(BAL_FILE_PATH))
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
  