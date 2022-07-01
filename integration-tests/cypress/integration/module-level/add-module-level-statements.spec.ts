import { Canvas } from "../../utils/components/canvas";
import { TopLevelPlusWidget } from "../../utils/components/top-level-plus-widget";
import { getIntegrationTestPageURL } from "../../utils/story-url-utils";
import { StatementEditor } from "../../utils/components/statement-editor/statement-editor";
import { EditorPane } from "../../utils/components/statement-editor/editor-pane";
import { InputEditor } from "../../utils/components/statement-editor/input-editor";
import { SuggestionsPane } from "../../utils/components/statement-editor/suggestions-pane";
import { RecordForm } from "../../utils/forms/record-form";
import { ListenerForm } from "../../utils/forms/listener-form";
import { EnumerationForm } from "../../utils/forms/enumeration-form";
import { SourceCode } from "../../utils/components/code-view";
import { getCurrentSpecFolder } from "../../utils/file-utils";

const BAL_FILE_PATH = "default/empty-file.bal";

describe("Add module-level statements via Low Code", () => {
    beforeEach(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH));
    });

    it("Add a variable to empty file", () => {
        Canvas.welcomeMessageShouldBeVisible().clickTopLevelPlusButton();
        TopLevelPlusWidget.clickOption("Variable");

        StatementEditor
            .shouldBeVisible()
            .getEditorPane();

        EditorPane
            .getStatementRenderer()
            .getExpression("SimpleNameReference")
            .doubleClickExpressionContent(`<add-expression>`);

        InputEditor
            .typeInput('"Hello World"');

        EditorPane
            .validateNewExpression("StringLiteral", "Hello World")
            .getExpression("IntTypeDesc")
            .clickExpressionContent('int');

        SuggestionsPane
            .clickSuggestionsTab("Suggestions")
            .clickLsSuggestion('string');

        EditorPane
            .validateNewExpression("StringTypeDesc", "string")
            .getExpression("CaptureBindingPattern")
            .doubleClickExpressionContent('variable');

        InputEditor
            .typeInput("foo");

        EditorPane
            .validateNewExpression("CaptureBindingPattern", "foo");

        StatementEditor
            .save();
    });

    it("Add a record to empty file", () => {
        Canvas.welcomeMessageShouldBeVisible().clickTopLevelPlusButton();
        TopLevelPlusWidget.clickOption("Record");

        RecordForm.shouldBeVisible()
            .typeRecordName("Animal")
            .clickWhiteSpace()
            .haveRecordName("Animal")
            .editRecord()
            .typeRecordName("Foo")
            .clickWhiteSpace()
            .haveRecordName("Foo")
            .makePublicRecord()
            .toggleClosedRecord()
            .addNewField("int", "hello") //Have an issue here when adding default value
            .clickWhiteSpace()
            .addNewField("int", "world")
            .deleteFirstField("hello")
            .save()
    });

    it("Add a configurable to empty file", () => {
        Canvas.welcomeMessageShouldBeVisible().clickTopLevelPlusButton();
        TopLevelPlusWidget.clickOption("Configurable");

        StatementEditor
            .shouldBeVisible()
            .getEditorPane();

        EditorPane
            .getStatementRenderer()
            .getExpression("CaptureBindingPattern")
            .doubleClickExpressionContent('conf');

        InputEditor
            .typeInput("foo");

        EditorPane
            .validateNewExpression("CaptureBindingPattern", "foo")
            .getExpression("RequiredExpression")
            .doubleClickExpressionContent('?');

        InputEditor
            .typeInput('"Hello World"');

        EditorPane
            .validateNewExpression("StringLiteral", "Hello World")
            .getExpression("IntTypeDesc")
            .doubleClickExpressionContent('int');

        InputEditor
            .typeInput('string');

        EditorPane
            .validateNewExpression("StringTypeDesc", "string");

        StatementEditor
            .save();
    });

    it("Add a constant to empty file", () => {
        Canvas.welcomeMessageShouldBeVisible().clickTopLevelPlusButton();
        TopLevelPlusWidget.clickOption("Constant");

        StatementEditor
            .shouldBeVisible()
            .getEditorPane();

        EditorPane
            .getStatementRenderer()
            .getExpression("IdentifierToken")
            .doubleClickExpressionContent('CONST_NAME');

        InputEditor
            .typeInput("FOO");

        EditorPane
            .validateNewExpression("IdentifierToken", "FOO")
            .getExpression("SimpleNameReference")
            .doubleClickExpressionContent(`<add-expression>`);

        InputEditor
            .typeInput('"Hello World"');

        EditorPane
            .validateNewExpression("StringLiteral", "Hello World");

        StatementEditor
            .save();
    });

    it("Add a listener to empty file", () => {
        Canvas.welcomeMessageShouldBeVisible().clickTopLevelPlusButton();
        TopLevelPlusWidget.clickOption("Listener");

        ListenerForm.shouldBeVisible()
            .typeListenerName("hello")
            .typeListenerPortValue(9090)
            .save();
    });

    it("Add a enum to empty file", () => {
        Canvas.welcomeMessageShouldBeVisible().clickTopLevelPlusButton();
        TopLevelPlusWidget.clickOption("Enum");

        EnumerationForm.shouldBeVisible()
            .typeEnumName("Foo")
            .clickWhiteSpace()
            .haveEnumName("Foo")
            .addNewMember("RED")
            .addNewMember("GREEN")
            .addNewMember("BLUE")
            .save();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "add-enum.expected.bal"
        );
    });
});
