import { Canvas } from "../../utils/components/canvas"
import { SourceCode } from "../../utils/components/code-view"
import { TopLevelPlusWidget } from "../../utils/components/top-level-plus-widget"
import { getCurrentSpecFolder } from "../../utils/file-utils"
import { HttpForm } from "../../utils/forms/connectors/http-form"
import { LogForm } from "../../utils/forms/log-form"
import { ResourceForm } from "../../utils/forms/resource-form"
import { ServiceForm } from "../../utils/forms/service-form"
import { getIntegrationTestStoryURL } from "../../utils/story-url-utils"

describe('edit a http service', () => {
    beforeEach(() => {
      cy.visit(getIntegrationTestStoryURL("service/edit-existing-service-file.bal"))
    })
  
    it('Edit Service', () => {
      //   Canvas.getService("/hello")
      //   .getResourceFunction("POST", "/")
      //   .expand()
      //   .getDiagram()
      //   .shouldBeRenderedProperly()
      //   .getBlockLevelPlusWidget()
      //   .clickOption("Log");

      //   LogForm
      // .shouldBeVisible()
      // .selectType("Debug")
      // .typeExpression(`"This is a debug message."`)
      // .save();

      Canvas.getService("/hello")
        .getResourceFunction("POST", "/")
        .expand()
        .getDiagram()
        .shouldBeRenderedProperly()
        .getBlockLevelPlusWidget()
        .clickOption("HTTP");

        HttpForm
        .shouldBeVisible()
        .waitForConnectorLoad()
        .haveDefaultName()
        .typeConnectionName("boo")
        .typeUrl('"https://google.com"')
        .continueToInvoke()
        .selectOperation("GET")
        .typeOperationPath('"foo"')
        .saveAndDone();

        // ResourceForm
        // .selectMethod("DELETE")
        // .typePathName("hello")
        // .save()

        // Canvas.getService("/hello")
        // .getResourceFunction("POST", "hello")
        // .deleteResource();

        // Canvas.getService("/hello")
        // .shouldHaveResources(1);
       
    })

  })
  