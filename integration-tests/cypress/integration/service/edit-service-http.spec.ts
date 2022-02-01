import { Canvas } from "../../utils/components/canvas"
import { SourceCode } from "../../utils/components/code-view"
import { TopLevelPlusWidget } from "../../utils/components/top-level-plus-widget"
import { getCurrentSpecFolder } from "../../utils/file-utils"
import { ServiceForm } from "../../utils/forms/service-form"
import { getIntegrationTestStoryURL } from "../../utils/story-url-utils"

describe('edit a http service', () => {
    beforeEach(() => {
      cy.visit(getIntegrationTestStoryURL("service/edit-existing-service-file.bal"))
    })
  
    it('Edit Service', () => {
        Canvas.getService("/hello")
        .expandToggle();
       
    })

  })
  