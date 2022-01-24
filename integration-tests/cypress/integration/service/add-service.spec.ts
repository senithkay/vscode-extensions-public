import { Canvas } from "../../utils/components/canvas"
import { SourceCode } from "../../utils/components/code-view"
import { TopLevelPlusWidget } from "../../utils/components/top-level-plus-widget"
import { getCurrentSpecFolder } from "../../utils/file-utils"
import { ServiceForm } from "../../utils/forms/service-form"
import { getIntegrationTestStoryURL } from "../../utils/story-url-utils"

describe('add a http service to an empty file', () => {
    beforeEach(() => {
      cy.visit(getIntegrationTestStoryURL("service/add-service-to-empty-file.bal"))
    })
  
    it('Displays add construct message', () => {
        Canvas
          .welcomeMessageShouldBeVisible()
          .clickTopLevelPlusButton();
        TopLevelPlusWidget.clickOption("Service");
        ServiceForm
          .selectServiceType("HTTP")
          .typeServicePath("/hello")
          .clickDefineListenerInLine()
          .typeListenerPort(9090)
          .save();
        SourceCode.shouldBeEqualTo(
          getCurrentSpecFolder() + "add-service.expected.bal");
    })

  })
  