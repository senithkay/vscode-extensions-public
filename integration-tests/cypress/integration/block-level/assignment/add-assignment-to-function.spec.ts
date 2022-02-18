import { Canvas } from "../../../utils/components/canvas";
import { SourceCode } from "../../../utils/components/code-view";
import { getCurrentSpecFolder } from "../../../utils/file-utils";
import { getIntegrationTestPageURL } from "../../../utils/story-url-utils";
import { AssignmentForm } from "../../../utils/forms/assignment-form";

const BAL_FILE_PATH = "block-level/assignment/add-assignment-to-function.bal";

describe('Add assignment to function via Low Code', () => {
  beforeEach(() => {
    cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH))
  })

  it('Add an assignment to function', () => {
    Canvas.getFunction("myFunction")
      .nameShouldBe("myFunction")
      .shouldBeExpanded()
      .getDiagram()
      .shouldBeRenderedProperly()
      .clickDefaultWorkerPlusBtn(1)
      .getBlockLevelPlusWidget()
      .clickOption("Assignment");

    AssignmentForm
      .shouldBeVisible()
      .typeVariableName("varName")
      .typeVariableValue(200)
      .save()

    SourceCode.shouldBeEqualTo(
      getCurrentSpecFolder() + "add-assignment-to-function.expected.bal");
  })

  it('Open and Cancel Assignment Form', () => {
    Canvas.getFunction("myFunction")
      .nameShouldBe("myFunction")
      .shouldBeExpanded()
      .getDiagram()
      .shouldBeRenderedProperly()
      .clickDefaultWorkerPlusBtn(1)
      .getBlockLevelPlusWidget()
      .clickOption("Assignment");

    AssignmentForm
      .shouldBeVisible()
      .cancel();

  });

  it('Open and Close Assignment Form', () => {
    Canvas.getFunction("myFunction")
      .nameShouldBe("myFunction")
      .shouldBeExpanded()
      .getDiagram()
      .shouldBeRenderedProperly()
      .clickDefaultWorkerPlusBtn(1)
      .getBlockLevelPlusWidget()
      .clickOption("Assignment");

    AssignmentForm
      .shouldBeVisible()
      .close();
    
  });

})
