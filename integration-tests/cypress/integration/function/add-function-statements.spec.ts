import { Canvas } from "../../utils/components/canvas";
import { SourceCode } from "../../utils/components/code-view";
import { TopLevelPlusWidget } from "../../utils/components/top-level-plus-widget";
import { getCurrentSpecFolder } from "../../utils/file-utils";
import { AssignmentForm } from "../../utils/forms/assignment-form";
import { ForEachForm } from "../../utils/forms/foreach-form";
import { FunctionForm } from "../../utils/forms/function-form";
import { IfForm } from "../../utils/forms/if-form";
import { LogForm } from "../../utils/forms/log-form";
import { OtherForm } from "../../utils/forms/other-form";
import { ReturnForm } from "../../utils/forms/return-form";
import { VariableFormBlockLevel } from "../../utils/forms/variable-form-block-level";
import { WhileForm } from "../../utils/forms/while-form";
import { getIntegrationTestStoryURL } from "../../utils/story-url-utils"

const BAL_FILE_PATH = "function/add-function-to-empty-file.bal";

describe('Add function and statements via Low Code', () => {
  beforeEach(() => {
    cy.visit(getIntegrationTestStoryURL(BAL_FILE_PATH))
  })

  it('Add a function and log statemnt to empty file', () => {
    Canvas
      .welcomeMessageShouldBeVisible()
      .clickTopLevelPlusButton();
    TopLevelPlusWidget.clickOption("Function");

    FunctionForm
      .shouldBeVisible()
      .typeFunctionName("myfunction")
      .typeReturnType("json|error?")
      .save();

    Canvas.getFunction("myfunction")
      .nameShouldBe("myfunction")
      .shouldBeExpanded()
      .getDiagram()
      .shouldBeRenderedProperly()
      .getBlockLevelPlusWidget()
      .clickOption("Log");

    LogForm
      .shouldBeVisible()
      .selectType("Info")
      .typeExpression(`"This is an info message."`)
      .save();

    SourceCode.shouldBeEqualTo(
        getCurrentSpecFolder() + "add-info-log-expected.bal");
  })

  it("Add a function and variable to empty file", () => {

    Canvas
      .welcomeMessageShouldBeVisible()
      .clickTopLevelPlusButton();
    TopLevelPlusWidget.clickOption("Function");

    FunctionForm
      .shouldBeVisible()
      .typeFunctionName("myfunction")
      .typeReturnType("json|error?")
      .save();

    Canvas.getFunction("myfunction")
      .nameShouldBe("myfunction")
      .shouldBeExpanded()
      .getDiagram()
      .shouldBeRenderedProperly()
      .getBlockLevelPlusWidget()
      .clickOption("Variable");

    VariableFormBlockLevel.shouldBeVisible()
      .typeVariableType("int")
      .typeVariableName("foo")
      .typeVariableValue(123)
      .save();
  })
  it("Add a function and assignment to empty file", () => {

    Canvas
      .welcomeMessageShouldBeVisible()
      .clickTopLevelPlusButton();
    TopLevelPlusWidget.clickOption("Function");

    FunctionForm
      .shouldBeVisible()
      .typeFunctionName("myfunction")
      .typeReturnType("json|error?")
      .save();

    Canvas.getFunction("myfunction")
      .nameShouldBe("myfunction")
      .shouldBeExpanded()
      .getDiagram()
      .shouldBeRenderedProperly()
      .getBlockLevelPlusWidget()
      .clickOption("Variable");

    VariableFormBlockLevel.shouldBeVisible()
      .typeVariableType("int")
      .typeVariableName("foo")
      .typeVariableValue(123)
      .save();

    Canvas.getFunction("myfunction")
      .nameShouldBe("myfunction")
      .shouldBeExpanded()
      .getDiagram()
      .shouldBeRenderedProperly()
      .clickDefaultWorkerPlusBtn(1)
      .getBlockLevelPlusWidget()
      .clickOption("Assignment");


    AssignmentForm.shouldBeVisible()
      .selectVariableSuggestion("foo")
      .typeVariableValue(999)
      .save();
  })
  it("Add a function and other to empty file", () => {

    Canvas
      .welcomeMessageShouldBeVisible()
      .clickTopLevelPlusButton();
    TopLevelPlusWidget.clickOption("Function");

    FunctionForm
      .shouldBeVisible()
      .typeFunctionName("myfunction")
      .typeReturnType("json|error?")
      .save();

    Canvas.getFunction("myfunction")
      .nameShouldBe("myfunction")
      .shouldBeExpanded()
      .getDiagram()
      .shouldBeRenderedProperly()
      .getBlockLevelPlusWidget()
      .clickOption("Other");


    OtherForm.shouldBeVisible()
      .typeStatement("int foo = 321;")
      .save();

  })
  it("Add a function and if condition to empty file", () => {

    Canvas
      .welcomeMessageShouldBeVisible()
      .clickTopLevelPlusButton();
    TopLevelPlusWidget.clickOption("Function");

    FunctionForm
      .shouldBeVisible()
      .typeFunctionName("myfunction")
      .typeReturnType("json|error?")
      .save();

    Canvas.getFunction("myfunction")
      .nameShouldBe("myfunction")
      .shouldBeExpanded()
      .getDiagram()
      .shouldBeRenderedProperly()
      .getBlockLevelPlusWidget()
      .clickOption("Variable");

    VariableFormBlockLevel.shouldBeVisible()
      .typeVariableType("int")
      .typeVariableName("foo")
      .typeVariableValue(123)
      .save();

    Canvas.getFunction("myfunction")
      .nameShouldBe("myfunction")
      .shouldBeExpanded()
      .getDiagram()
      .shouldBeRenderedProperly()
      .clickDefaultWorkerPlusBtn(1)
      .getBlockLevelPlusWidget()
      .clickOption("If");

    IfForm.shouldBeVisible()
      .typeCondition("(foo === 123)", 1)
      // .clickAddExpression() //ResizeObserver - loop limit exceeded error
      .save();

    Canvas.getFunction("myfunction")
      .nameShouldBe("myfunction")
      .shouldBeExpanded()
      .getDiagram()
      .shouldBeRenderedProperly()
      .clickDefaultWorkerPlusBtn(2)
      .getBlockLevelPlusWidget()
      .clickOption("Return");

    ReturnForm.shouldBeVisible()
      .typeExpression("foo")
      .save();

  })


  it("Add a function and foreach to empty file", () => {

    Canvas
      .welcomeMessageShouldBeVisible()
      .clickTopLevelPlusButton();
    TopLevelPlusWidget.clickOption("Function");

    FunctionForm
      .shouldBeVisible()
      .typeFunctionName("myfunction")
      .typeReturnType("json|error?")
      .save();

    Canvas.getFunction("myfunction")
      .nameShouldBe("myfunction")
      .shouldBeExpanded()
      .getDiagram()
      .shouldBeRenderedProperly()
      .getBlockLevelPlusWidget()
      .clickOption("Variable");

    VariableFormBlockLevel.shouldBeVisible()
      .typeVariableType("int[]")
      .typeVariableName("foos")
      .typeVariableValue("[1,2,3,4,5,6]")
      .save();

    Canvas.getFunction("myfunction")
      .nameShouldBe("myfunction")
      .shouldBeExpanded()
      .getDiagram()
      .shouldBeRenderedProperly()
      .clickDefaultWorkerPlusBtn(1)
      .getBlockLevelPlusWidget()
      .clickOption("ForEach");

    ForEachForm.shouldBeVisible()
      .typeArrayType("int")
      .haveDefaultValueName()
      .typeCurrentValue("foo")
      .typeIterableExpression("foos")
      .save();

    Canvas.getFunction("myfunction")
      .nameShouldBe("myfunction")
      .shouldBeExpanded()
      .getDiagram()
      .shouldBeRenderedProperly()
      .clickForEachWorkerPlusBtn(0)
      .getBlockLevelPlusWidget()
      .clickOption("Log");

    LogForm
      .shouldBeVisible()
      .selectType("Debug")
      .typeExpression("foo")
      .diagnosticsShouldBeVisible()
      .clickDiagnosticsSupportButton()
      .save();

    Canvas.getFunction("myfunction")
      .nameShouldBe("myfunction")
      .shouldBeExpanded()
      .getDiagram()
      .shouldBeRenderedProperly()
      .clickDefaultWorkerPlusBtn(2)
      .getBlockLevelPlusWidget()
      .clickOption("Return");

    ReturnForm.shouldBeVisible()
      .typeExpression("foos")
      .save();

  })

  it("Add a function and while to empty file", () => {

    Canvas
      .welcomeMessageShouldBeVisible()
      .clickTopLevelPlusButton();
    TopLevelPlusWidget.clickOption("Function");

    FunctionForm
      .shouldBeVisible()
      .typeFunctionName("myfunction")
      .typeReturnType("json|error?")
      .save();

    Canvas.getFunction("myfunction")
      .nameShouldBe("myfunction")
      .shouldBeExpanded()
      .getDiagram()
      .shouldBeRenderedProperly()
      .getBlockLevelPlusWidget()
      .clickOption("Variable");

    VariableFormBlockLevel.shouldBeVisible()
      .typeVariableType("int")
      .typeVariableName("foo")
      .typeVariableValue(123)
      .save();

    Canvas.getFunction("myfunction")
      .nameShouldBe("myfunction")
      .shouldBeExpanded()
      .getDiagram()
      .shouldBeRenderedProperly()
      .clickDefaultWorkerPlusBtn(1)
      .getBlockLevelPlusWidget()
      .clickOption("While");

    WhileForm.shouldBeVisible()
      .typeCondition("foo == 123")
      .save();

    Canvas.getFunction("myfunction")
      .nameShouldBe("myfunction")
      .shouldBeExpanded()
      .getDiagram()
      .shouldBeRenderedProperly()
      .clickWhileWorkerPlusBtn(0)
      .getBlockLevelPlusWidget()
      .clickOption("Log");

    LogForm
      .shouldBeVisible()
      .selectType("Warn")
      .typeExpression(`"This is a warning message."`)
      .save();

    Canvas.getFunction("myfunction")
      .nameShouldBe("myfunction")
      .shouldBeExpanded()
      .getDiagram()
      .shouldBeRenderedProperly()
      .clickDefaultWorkerPlusBtn(2)
      .getBlockLevelPlusWidget()
      .clickOption("Return");

    ReturnForm.shouldBeVisible()
      .typeExpression("foo")
      .save();

  })
  it('Add a function and error log statement to empty file', () => {
    Canvas
      .welcomeMessageShouldBeVisible()
      .clickTopLevelPlusButton();
    TopLevelPlusWidget.clickOption("Function");

    FunctionForm
      .shouldBeVisible()
      .typeFunctionName("myfunction")
      .typeReturnType("json|error?")
      .save();

    Canvas.getFunction("myfunction")
      .nameShouldBe("myfunction")
      .shouldBeExpanded()
      .getDiagram()
      .shouldBeRenderedProperly()
      .getBlockLevelPlusWidget()
      .clickOption("Log");

    LogForm
      .shouldBeVisible()
      .selectType("Error")
      .typeExpression(`"This is an error message."`)
      .save();

    SourceCode.shouldBeEqualTo(
        getCurrentSpecFolder() + "add-error-log.expected.bal");
  })

  it('Add a log and close the panel without saving', () => {
    Canvas
      .welcomeMessageShouldBeVisible()
      .clickTopLevelPlusButton();
    TopLevelPlusWidget.clickOption("Function");

    FunctionForm
      .shouldBeVisible()
      .typeFunctionName("myfunction")
      .typeReturnType("json|error?")
      .save();

    Canvas.getFunction("myfunction")
      .nameShouldBe("myfunction")
      .shouldBeExpanded()
      .getDiagram()
      .shouldBeRenderedProperly()
      .getBlockLevelPlusWidget()
      .clickOption("Log");

    LogForm
      .shouldBeVisible()
      .selectType("Info")
      .close()

    SourceCode.shouldBeEqualTo(
        getCurrentSpecFolder() + "close-log-form.expected.bal");
  })

})
