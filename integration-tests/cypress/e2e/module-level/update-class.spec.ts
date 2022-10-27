import { Canvas } from "../../utils/components/canvas";
import { SourceCode } from "../../utils/components/code-view";
import { ConfirmWindow } from "../../utils/components/confirm-window";
import { getCurrentSpecFolder } from "../../utils/file-utils";

import { getIntegrationTestPageURL } from "../../utils/story-url-utils"

const CLASS_BAL_FILE_PATH = "class/edit-existing-class-file.bal";

const CLASS_NAME = 'Person';

describe('Test editing and deleting a class component', () => {
    beforeEach(() => {
        cy.visit(getIntegrationTestPageURL(CLASS_BAL_FILE_PATH));
    });

    it('Edit a class component', () => {
        Canvas
            .getClass(CLASS_NAME)
            .edit();
        ConfirmWindow.shouldBeVisible()
            .clickNo();

        Canvas
            .getClass(CLASS_NAME)
            .edit();
        ConfirmWindow.shouldBeVisible()
            .clickYes();

        SourceCode.shouldBeEqualTo(getCurrentSpecFolder() + "update-class.expected.bal");

    });

    it('Delete a class component', () => {
        Canvas
            .getClass(CLASS_NAME)
            .delete();

        SourceCode.shouldBeEqualTo(getCurrentSpecFolder() + "add-class.expected.bal");
    });
});
