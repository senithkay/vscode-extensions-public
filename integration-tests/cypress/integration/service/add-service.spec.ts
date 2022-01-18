import { DiagramCanvas } from "../../utils/components/canvas"
import { getIntegrationTestStoryURL } from "../../utils/story-url-utils"

describe('add a http service to an empty file', () => {
    beforeEach(() => {
      cy.visit(getIntegrationTestStoryURL("service/add-service-to-empty-file.bal"))
    })
  
    it('Displays add construct message', () => {
        DiagramCanvas.welcomeMessageShouldBeVisible();
    })

  })
  