import { Canvas } from "../../../utils/components/canvas";
import { SourceCode } from "../../../utils/components/code-view";
import { getCurrentSpecFolder } from "../../../utils/file-utils";
import { getIntegrationTestStoryURL } from "../../../utils/story-url-utils";
import { AssignmentForm } from "../../../utils/forms/assignment-form";
import { DeleteWindow } from "../../../utils/components/delete-window";

const BAL_FILE_PATH = "block-level/assignment/add-assignment-to-function.bal";

describe('Add assignment to function via Low Code', () => {
  beforeEach(() => {
    cy.visit(getIntegrationTestStoryURL(BAL_FILE_PATH))
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

  it('Delete an assignment in function', () => {
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

    Canvas.getFunction("myFunction")
      .shouldBeExpanded()
      .getDiagram()
      .shouldBeRenderedProperly()
      .clickDeleteExistingBlockStatement(1);

    DeleteWindow.
      shouldBeVisible()
      .clickRemove();

    SourceCode.shouldBeEqualTo(
      getCurrentSpecFolder() + "delete-assignment-to-function.expected.bal");
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
