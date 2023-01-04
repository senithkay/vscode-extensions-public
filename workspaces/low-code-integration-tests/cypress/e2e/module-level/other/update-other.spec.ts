import { Canvas } from "../../../utils/components/canvas";
import { SourceCode } from "../../../utils/components/code-view";
import { ConfirmWindow } from "../../../utils/components/confirm-window";
import { getCurrentSpecFolder } from "../../../utils/file-utils";
import { OtherForm } from "../../../utils/forms/other-form";
import { getIntegrationTestPageURL } from "../../../utils/story-url-utils"

const BAL_FILE_PATH = "other/edit-existing-other-file.bal";

describe('Test editing and deleting a module level other component', () => {
    beforeEach(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH))
    });

    it('Edit an other statement', () => {
        Canvas
            .getOtherComponent()
            .edit();

        ConfirmWindow
            .shouldBeVisible()
            .clickYes();

        SourceCode.shouldBeEqualTo(getCurrentSpecFolder() + "edit-other.expected.bal");
    });

    it('Delete an other statement', () => {
        Canvas
            .getOtherComponent()
            .delete();

        SourceCode.shouldBeEqualTo(getCurrentSpecFolder() + "delete-other.expected.bal");
    });
})
