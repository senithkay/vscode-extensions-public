/// <reference types="cypress" />

import { getIntegrationTestStoryURL } from "../../utils/story-url-utils"

describe('add a http service to an empty file', () => {
    beforeEach(() => {
      cy.visit(getIntegrationTestStoryURL("service/add-service-to-empty-file.bal"))
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
  