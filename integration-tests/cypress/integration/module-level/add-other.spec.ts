import { Canvas } from "../../utils/components/canvas";
import { TopLevelPlusWidget } from "../../utils/components/top-level-plus-widget";
import { OtherForm } from "../../utils/forms/other-form";
import { getIntegrationTestPageURL } from "../../utils/story-url-utils"

const BAL_FILE_PATH = "default/empty-file.bal";

describe('Test adding a module level other component', () => {
    beforeEach(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH))
    });

    it('Add an other statement to an empty file', () => {
        Canvas
            .welcomeMessageShouldBeVisible()
            .clickTopLevelPlusButton();

        TopLevelPlusWidget.clickOption('Other');

        OtherForm
            .shouldBeVisible()
            .typeStatement(`type AnnotationData record {|

                |};`)
            .save();

        // TODO: Enable this part once incorrect diagnostics in the expression editor is resolved.
        // Canvas.clickTopLevelPlusButton(2);
        // TopLevelPlusWidget.clickOption("Other");

        // OtherForm.shouldBeVisible()
        //     .typeStatement(`const annotation AnnotationData MyAnnot on service;`)
        //     .save();

        // SourceCode.shouldBeEqualTo(getCurrentSpecFolder() + "add-class.expected.bal");
    });
});
