import { Canvas } from "../../utils/components/canvas";
import { SourceCode } from "../../utils/components/code-view";
import { getCurrentSpecFolder } from "../../utils/file-utils";
import { OtherForm } from "../../utils/forms/other-form";
import { getIntegrationTestStoryURL } from "../../utils/story-url-utils"

const BAL_FILE_PATH = "function/add-other-statement-file.bal";

const COMPONENT_NAME = "Other";

describe('Test adding an other component', () => {
    beforeEach(() => {
        cy.visit(getIntegrationTestStoryURL(BAL_FILE_PATH))
    });

    it('Add an other statement', () => {
        Canvas
            .getFunction('testOtherStatementFunction')
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickForEachWorkerPlusBtn()
            .getBlockLevelPlusWidget()
            .clickOption(COMPONENT_NAME);

        OtherForm
            .shouldBeVisible()
            .typeStatement(`match counter {
            0 => {
                io:println("value is: 0");
            }
            1 => {
                io:println("value is: 1");
            }
        }`, false)
            .save();

        SourceCode.shouldBeEqualTo(getCurrentSpecFolder() + "add-other.expected.bal");
    });
});
