import { getIntegrationTestStoryURL } from "../../../utils/story-url-utils";
import { Canvas } from "../../../utils/components/canvas";
import { SourceCode } from "../../../utils/components/code-view";
import { getCurrentSpecFolder } from "../../../utils/file-utils";

const BAL_FILE_PATH = "return/existing-return-statement.bal";

describe('Delete return statement', () => {
    beforeEach(() => {
        cy.visit(getIntegrationTestStoryURL(BAL_FILE_PATH))
    })

    it('Delete return statement', () => {
        Canvas.getFunction("getGreetings")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .deleteExistingReturnStatement()

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "delete-return-statement.expected.bal");
    })
})
