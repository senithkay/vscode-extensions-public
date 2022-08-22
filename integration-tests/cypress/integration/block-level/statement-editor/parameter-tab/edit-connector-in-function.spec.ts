import { Canvas } from "../../../../utils/components/canvas";
import { SourceCode } from "../../../../utils/components/code-view";
import { ParameterTab } from "../../../../utils/components/statement-editor/parameter-tab";
import { StatementEditor } from "../../../../utils/components/statement-editor/statement-editor";
import { getCurrentSpecFolder } from "../../../../utils/file-utils";
import { getIntegrationTestPageURL } from "../../../../utils/story-url-utils";

const BAL_FILE_PATH = "block-level/connector/edit-connector-in-function.bal";

describe('Edit connector with custom configurations via Low Code', () => {
    beforeEach(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH));
    });

    it('Edit http endpoint with custom configurations', () => {
        Canvas.getFunction("myfunction")
            .nameShouldBe("myfunction")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickEditOnExistingEndpointStatement(3);

        StatementEditor
            .shouldBeVisible();

        ParameterTab
            .shouldBeFocused()
            .shouldHaveParameterTree()
            .shouldHaveInclusionArg("config")
            .shouldHaveCustomArg("httpVersion")
            .shouldHaveCustomArg("timeout")
            .shouldHaveRecordArg("cache")
            .shouldHaveCustomArg("enabled")
            .shouldHaveUnionArg("compression")
            .toggleInclusionArg("config");
cy.wait(500);
        StatementEditor
            .save();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "edit-connector-in-function.expected.bal");
    });

    it('Edit http endpoint and cancel', () => {
        Canvas.getFunction("myfunction")
            .nameShouldBe("myfunction")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickEditOnExistingEndpointStatement(3);

        StatementEditor
            .shouldBeVisible();

        StatementEditor
            .cancel();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "add-connector-to-function.expected.bal");
    });

});
