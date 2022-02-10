import { Canvas } from "../../utils/components/canvas";
import { SourceCode } from "../../utils/components/code-view";
import { getCurrentSpecFolder } from "../../utils/file-utils";
import { getIntegrationTestStoryURL } from "../../utils/story-url-utils"

const BAL_FILE_PATH = "function/function.bal";

describe('Delete function', () => {
  beforeEach(() => {
    cy.visit(getIntegrationTestStoryURL(BAL_FILE_PATH))
  })

  it('Delete function', () => {
    Canvas.getFunction("getGreeting")
      .nameShouldBe("getGreeting")
      .delete();

    SourceCode.shouldBeEqualTo(
      getCurrentSpecFolder() + "delete-function.expected.bal");
  })
})
