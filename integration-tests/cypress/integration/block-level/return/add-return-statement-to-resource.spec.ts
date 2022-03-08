import { getIntegrationTestPageURL } from "../../../utils/story-url-utils";
import { Canvas } from "../../../utils/components/canvas";
import { ReturnForm } from "../../../utils/forms/return-form";
import { SourceCode } from "../../../utils/components/code-view";
import { getCurrentSpecFolder } from "../../../utils/file-utils";

const BAL_FILE_PATH = "block-level/return/add-return-to-service-resource.bal";

describe('Add return statement to resource function', () => {
    beforeEach(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH))
    })

    it('Add empty return statement to resource function', () => {
        Canvas.getService("/hello")
            .getResourceFunction("POST", "/")
            .getDiagram()
            .shouldBeRenderedProperly()
            .getBlockLevelPlusWidget()
            .clickOption("Return");

        ReturnForm
            .shouldBeVisible()
            .save()

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "add-return-statement-to-resource.expected.bal");
    })
})
