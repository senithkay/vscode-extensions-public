import { Canvas } from "../../utils/components/canvas"
import { SourceCode } from "../../utils/components/code-view"
import { TopLevelPlusWidget } from "../../utils/components/top-level-plus-widget"
import { getCurrentSpecFolder } from "../../utils/file-utils"
import { HttpForm } from "../../utils/forms/connectors/http-form"
import { LogForm } from "../../utils/forms/log-form"
import { ResourceForm } from "../../utils/forms/resource-form"
import { ServiceForm } from "../../utils/forms/service-form"
import { getIntegrationTestPageURL } from "../../utils/story-url-utils"

const BAL_FILE_PATH = "service/add-service-to-empty-file.bal";

describe('delete resource after adding it', () => {
  beforeEach(() => {
    cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH))
  })

  it('Delete after adding service', () => {
    Canvas
      .welcomeMessageShouldBeVisible()
      .clickTopLevelPlusButton();
    TopLevelPlusWidget.clickOption("Service");

    ServiceForm
      .typeServicePath("/hello")
      .typeListenerPort(9090)
      .save();

    Canvas.getService('/hello')
        .clickPlusIcon(3);

    ResourceForm
      .selectMethod("GET")
      .typePathName("world")
      .save()

    Canvas.getService("/hello")
      .shouldHaveResources(2)

    Canvas.getService("/hello")
      .getResourceFunction("GET", "world")
      .deleteResource();

    Canvas.getService("/hello")
      .shouldHaveResources(1)

    SourceCode.shouldBeEqualTo(
      getCurrentSpecFolder() + "delete-service-resource.expected.bal");
  })

})
