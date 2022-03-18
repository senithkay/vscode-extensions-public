import { Canvas } from "../../utils/components/canvas";
import { ConfirmWindow } from "../../utils/components/confirm-window";
import { TopLevelPlusWidget } from "../../utils/components/top-level-plus-widget";
import { getIntegrationTestPageURL } from "../../utils/story-url-utils"

const EMPTY_BAL_FILE_PATH = "default/empty-file.bal";

const COMPONENT_NAME = "Class";

describe('Test adding a class component', () => {
    beforeEach(() => {
        cy.visit(getIntegrationTestPageURL(EMPTY_BAL_FILE_PATH));
    });

    it('Add a class to an empty file', () => {
        Canvas
            .welcomeMessageShouldBeVisible()
            .clickTopLevelPlusButton();

        TopLevelPlusWidget
            .clickOption(COMPONENT_NAME);

        ConfirmWindow
            .shouldBeVisible()
            .clickNo();

        Canvas
            .welcomeMessageShouldBeVisible()
            .clickTopLevelPlusButton();

        TopLevelPlusWidget
            .clickOption(COMPONENT_NAME);

        ConfirmWindow
            .shouldBeVisible()
            .clickYes();

        Canvas
            .welcomeMessageShouldBeVisible();
    });
});
