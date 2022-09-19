import { BlockLevelPlusWidget } from "../../utils/components/block-level-plus-widget";
import { Canvas } from "../../utils/components/canvas"
import { SourceCode } from "../../utils/components/code-view"
import { EditorPane } from "../../utils/components/statement-editor/editor-pane";
import { InputEditor } from "../../utils/components/statement-editor/input-editor";
import { StatementEditor } from "../../utils/components/statement-editor/statement-editor";
import { getCurrentSpecFolder } from "../../utils/file-utils"
import { getIntegrationTestPageURL } from "../../utils/story-url-utils"

const BAL_FILE_PATH = "service/edit-existing-service-file.bal";

describe('edit a http service', () => {
  beforeEach(() => {
    cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH))
  })

  it('Edit service and add statements', () => {
    Canvas.getService("/hello")
      .getResourceFunction("POST", "/")
      .expand()
      .getDiagram()
      .shouldBeRenderedProperly()
        .clickDefaultWorkerPlusBtn(0)
      .getBlockLevelPlusWidget()

    BlockLevelPlusWidget
        .clickOption("Variable");

    StatementEditor
        .shouldBeVisible()
        .getEditorPane();

    EditorPane
        .getStatementRenderer()
        .getExpression("SimpleNameReference")
        .doubleClickExpressionContent(`<add-expression>`);

    InputEditor
        .typeInput("123");

    EditorPane
        .validateNewExpression("NumericLiteral", "123")
        .getExpression("VarTypeDesc")
        .doubleClickExpressionContent("var");

    InputEditor
        .typeInput("int");

    EditorPane
        .validateNewExpression("IntTypeDesc", "int")
        .getExpression("CaptureBindingPattern")
        .doubleClickExpressionContent("variable");

    InputEditor
        .typeInput("foo");

    EditorPane
        .validateNewExpression("CaptureBindingPattern", "foo")

    StatementEditor
        .save();

    Canvas.getService("/hello")
      .getResourceFunction("POST", "/")
      .getDiagram()
      .shouldBeRenderedProperly()
      .clickDefaultWorkerPlusBtn(1)
      .getBlockLevelPlusWidget()

    BlockLevelPlusWidget
      .clickOption("Variable");

    StatementEditor
        .shouldBeVisible()
        .getEditorPane();

    EditorPane
        .getStatementRenderer()
        .getExpression("SimpleNameReference")
        .doubleClickExpressionContent(`<add-expression>`);

    InputEditor
        .typeInput("456");

    StatementEditor
        .save();

    SourceCode.shouldBeEqualTo(
      getCurrentSpecFolder() + "edit-service-http.expected.bal");

  })

})
