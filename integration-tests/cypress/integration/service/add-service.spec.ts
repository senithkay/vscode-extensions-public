import { DiagramCanvas } from "../../utils/components/canvas"
import { TopLevelPlusWidget } from "../../utils/components/to-level-plus-widget"
import { getIntegrationTestStoryURL } from "../../utils/story-url-utils"

describe('add a http service to an empty file', () => {
    beforeEach(() => {
      cy.visit(getIntegrationTestStoryURL("service/add-service-to-empty-file.bal"))
    })
  
    it('Displays add construct message', () => {
        DiagramCanvas.welcomeMessageShouldBeVisible();
        DiagramCanvas.clickTopLevelPlusButton();
        TopLevelPlusWidget.clickOption("Service");
    })

  })
  