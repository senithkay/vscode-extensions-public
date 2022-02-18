import { Canvas } from "../../../utils/components/canvas";
import { SourceCode } from "../../../utils/components/code-view";
import { TopLevelPlusWidget } from "../../../utils/components/top-level-plus-widget";
import { getCurrentSpecFolder } from "../../../utils/file-utils";
import { WhileForm } from "../../../utils/forms/while-form";
import { getIntegrationTestStoryURL } from "../../../utils/story-url-utils";

const BAL_FILE_PATH = "block-level/while/add-while-to-function.bal";

describe('Add while to function via Low Code', () => {
  beforeEach(() => {
    cy.visit(getIntegrationTestStoryURL(BAL_FILE_PATH))
  })

  it('Add a while to function', () => {
    Canvas.getFunction("sampleFunction")
      .nameShouldBe("sampleFunction")
      .shouldBeExpanded()
      .getDiagram()
      .shouldBeRenderedProperly()
      .getBlockLevelPlusWidget()
      .clickOption("While");

    WhileForm
      .shouldBeVisible()
      .typeCondition("1<5")
      .save()

    SourceCode.shouldBeEqualTo(
      getCurrentSpecFolder() + "add-while-to-function.expected.bal");
  })

  it('Open and Cancel Form', () => {
    Canvas.getFunction("sampleFunction")
      .nameShouldBe("sampleFunction")
      .shouldBeExpanded()
      .getDiagram()
      .shouldBeRenderedProperly()
      .getBlockLevelPlusWidget()
      .clickOption("While");

    WhileForm
      .shouldBeVisible()
      .cancel();

  });

  it('Open and Cancel Form', () => {
    Canvas.getFunction("sampleFunction")
      .nameShouldBe("sampleFunction")
      .shouldBeExpanded()
      .getDiagram()
      .shouldBeRenderedProperly()
      .getBlockLevelPlusWidget()
      .clickOption("While");

    WhileForm
      .shouldBeVisible()
      .close();

  });

})
