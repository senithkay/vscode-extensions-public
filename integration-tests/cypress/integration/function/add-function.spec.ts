import { DiagramCanvas } from "../../utils/components/canvas";
import { CodeView } from "../../utils/components/code-view";
import { getCurrentSpecFolder } from "../../utils/file-utils";
import { getIntegrationTestStoryURL } from "../../utils/story-url-utils"

const BAL_FILE_PATH = "function/add-function-to-empty-file.bal";

describe('Add functions via Low Code', () => {
    beforeEach(() => {
      cy.visit(getIntegrationTestStoryURL(BAL_FILE_PATH))
    })
  
    it('Add a function to empty file', () => {
        DiagramCanvas.welcomeMessageShouldBeVisible();
        
        cy.get('#Top_plus')
            .click() // click on the top level plus button.
            .get(".options-wrapper")
            .contains("Function")
            .click() // click on the function option in plus widget.
            .get('[data-testid="function-form"]')
            .get('.view-lines')
            .first()
            .type('myfunction') // type 'myfunction' in the expression editor for fn name.
            .get('button')
            .contains("Save")
            .click() // click save button.
            .get('.function-signature .path-text')
            .should('have.text', 'myfunction') // check if the added function signature is drawn.

      CodeView.currentCodeShouldBeEqualToFile(getCurrentSpecFolder() + "add-function.expected.bal");
            
            cy // verify if the generated code is correct.
            .get('[data-testid="diagram-canvas"]')
            .should("be.visible") // verify if the diagram body is rendered correctly.
            .get('.diagram-canvas .start-wrapper .start-button .start-text')
            .should("be.visible")
            .should("have.text", " START  ")

    })
  })
  