import { Canvas } from "../../../utils/components/canvas";
import { SourceCode } from "../../../utils/components/code-view";
import { TopLevelPlusWidget } from "../../../utils/components/top-level-plus-widget";
import { getCurrentSpecFolder } from "../../../utils/file-utils";
import { IfForm } from "../../../utils/forms/if-form";
import { getIntegrationTestPageURL } from "../../../utils/story-url-utils";

const BAL_FILE_PATH = "block-level/if/add-if-to-function.bal";

describe('Add if to function via Low Code', () => {
  beforeEach(() => {
    cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH))
  })

  it('Add a if to function', () => {
    Canvas.getFunction("sampleFunction")
      .nameShouldBe("sampleFunction")
      .shouldBeExpanded()
      .getDiagram()
      .shouldBeRenderedProperly()
      .getBlockLevelPlusWidget()
      .clickOption("If");

    IfForm
      .shouldBeVisible()
      .typeCondition(true, 0)
      .save()

    SourceCode.shouldBeEqualTo(
      getCurrentSpecFolder() + "add-if-to-function.expected.bal");
  })

  it('Open and Cancel Form', () => {
    Canvas.getFunction("sampleFunction")
      .nameShouldBe("sampleFunction")
      .shouldBeExpanded()
      .getDiagram()
      .shouldBeRenderedProperly()
      .getBlockLevelPlusWidget()
      .clickOption("If");

    IfForm
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
      .clickOption("If");

    IfForm
      .shouldBeVisible()
      .close();

  });

})
