import { Canvas } from "../../../utils/components/canvas";
import { SourceCode } from "../../../utils/components/code-view";
import { TopLevelPlusWidget } from "../../../utils/components/top-level-plus-widget";
import { getCurrentSpecFolder } from "../../../utils/file-utils";
import { FunctionForm } from "../../../utils/forms/function-form";
import { LogForm } from "../../../utils/forms/log-form";
import { ReturnForm } from "../../../utils/forms/return-form";
import { VariableFormBlockLevel } from "../../../utils/forms/variable-form-block-level";
import { getIntegrationTestPageURL } from "../../../utils/story-url-utils";

const BAL_FILE_PATH = "block-level/variable/add-variable-to-function.bal";

describe('Add variable to function via Low Code', () => {
  beforeEach(() => {
    cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH))
  })

  it('Add a variable to function', () => {
    Canvas.getFunction("myfunction")
      .nameShouldBe("myfunction")
      .shouldBeExpanded()
      .getDiagram()
      .shouldBeRenderedProperly()
      .getBlockLevelPlusWidget()
      .clickOption("Variable");

    VariableFormBlockLevel
      .shouldBeVisible()
      .typeVariableType("int")
      .typeVariableName("varName")
      .typeVariableValue(14)
      .save()

    SourceCode.shouldBeEqualTo(
      getCurrentSpecFolder() + "add-variable-to-function.expected.bal");
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
