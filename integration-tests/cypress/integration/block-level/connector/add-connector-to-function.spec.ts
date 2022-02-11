import { Canvas } from "../../../utils/components/canvas";
import { SourceCode } from "../../../utils/components/code-view";
import { TopLevelPlusWidget } from "../../../utils/components/top-level-plus-widget";
import { getCurrentSpecFolder } from "../../../utils/file-utils";
import { ConnectorForm } from "../../../utils/forms/connector-form";
import { FunctionForm } from "../../../utils/forms/function-form";
import { LogForm } from "../../../utils/forms/log-form";
import { ReturnForm } from "../../../utils/forms/return-form";
import { TriggerForm } from "../../../utils/forms/trigger-form";
import { VariableFormBlockLevel } from "../../../utils/forms/variable-form-block-level";
import { getIntegrationTestStoryURL } from "../../../utils/story-url-utils";

const BAL_FILE_PATH = "block-level/connector/add-connector-to-function.bal";

describe('Add connector to function via Low Code', () => {
  beforeEach(() => {
    cy.visit(getIntegrationTestStoryURL(BAL_FILE_PATH))
  })

  it.only('Add a connector to function', () => {
    Canvas.getFunction("myfunction")
      .nameShouldBe("myfunction")
      .shouldBeExpanded()
      .getDiagram()
      .shouldBeRenderedProperly()
      .getBlockLevelPlusWidget()
      .clickOption("Connector");

      ConnectorForm
      .shouldBeVisible()
      .waitForConnectorsLoading()
      .searchConnector("Sheet")
      .waitForConnectorsLoading()
      .selectConnector("google sheets")
    // SourceCode.shouldBeEqualTo(
    //   getCurrentSpecFolder() + "add-variable-to-function.expected.bal");
  })

  it('Open and Cancel Form', () => {
    Canvas.getFunction("myfunction")
      .nameShouldBe("myfunction")
      .shouldBeExpanded()
      .getDiagram()
      .shouldBeRenderedProperly()
      .getBlockLevelPlusWidget()
      .clickOption("Variable");

    VariableFormBlockLevel
      .shouldBeVisible()
      .cancel();

  });

  it('Open and Close Form', () => {
    Canvas.getFunction("myfunction")
      .nameShouldBe("myfunction")
      .shouldBeExpanded()
      .getDiagram()
      .shouldBeRenderedProperly()
      .getBlockLevelPlusWidget()
      .clickOption("Variable");

    VariableFormBlockLevel
      .shouldBeVisible()
      .close();
    
  });

})
