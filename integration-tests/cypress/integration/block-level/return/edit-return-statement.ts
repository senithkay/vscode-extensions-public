import { getIntegrationTestStoryURL } from "../../../utils/story-url-utils";
import { Canvas } from "../../../utils/components/canvas";
import { ReturnForm } from "../../../utils/forms/return-form";
import { SourceCode } from "../../../utils/components/code-view";
import { getCurrentSpecFolder } from "../../../utils/file-utils";

const BAL_FILE_PATH = "block-level/return/existing-return-statement.bal";

describe('Edit return statement', () => {
    beforeEach(() => {
        cy.visit(getIntegrationTestStoryURL(BAL_FILE_PATH))
    })

    it('Edit return statement', () => {
        Canvas.getFunction("getGreetings")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickExistingReturnStatement()

        ReturnForm
            .shouldBeVisible()
            .clearExpression()
            .typeExpression('"Updated Hello World!!!"')
            .save()

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "edit-return-statement.expected.bal");
    })
})
