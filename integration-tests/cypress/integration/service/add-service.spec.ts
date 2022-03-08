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

describe('add a http service to an empty file', () => {
  beforeEach(() => {
    cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH))
  })

  it.skip('Add new service and resource', () => {
    Canvas
      .welcomeMessageShouldBeVisible()
      .clickTopLevelPlusButton();
    TopLevelPlusWidget.clickOption("Service");
    ServiceForm
      .selectServiceType("HTTP")
      .typeServicePath("/hello")
      .clickDefineListenerline()
      .typeListenerPort(9090)
      .save();
    Canvas.clickTopLevelPlusButton(5);
    TopLevelPlusWidget.clickOption("Resource");
    ResourceForm
      .selectMethod("GET")
      .typePathName("world")
      .save()

    Canvas.getService("/hello")
      .shouldHaveResources(2)

    Canvas.getService("/hello")
      .getResourceFunction("GET", "world")
      .expand()
      .shouldBeExpanded()
      .getDiagram()
      .shouldBeRenderedProperly()
      .getBlockLevelPlusWidget()
      .clickOption("HTTP");

    HttpForm
      .shouldBeVisible()
      .waitForConnectorLoad()
      .haveDefaultName()
      .typeConnectionName("boo")
      .typeUrl('"https://foo.com"')
      .continueToInvoke()
      .selectOperation("GET")
      .typeOperationPath('"foo"')
      .saveAndDone();

    Canvas.getService("/hello")
      .getResourceFunction("GET", "world")
      .shouldBeExpanded()
      .getDiagram()
      .clickDefaultWorkerPlusBtn(2)
      .getBlockLevelPlusWidget()
      .clickOption("Log")

    LogForm
      .shouldBeVisible()
      .selectType("Debug")
      .typeExpression(`"This is a debug message."`)
      .save();

    SourceCode.shouldBeEqualTo(
      getCurrentSpecFolder() + "add-service.expected.bal");
  })

})
