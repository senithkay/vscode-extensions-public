import { Canvas } from "../../utils/components/canvas";
import { SourceCode } from "../../utils/components/code-view";
import { getCurrentSpecFolder } from "../../utils/file-utils";
import { FunctionForm } from "../../utils/forms/function-form";
import { getIntegrationTestStoryURL } from "../../utils/story-url-utils"

const BAL_FILE_PATH = "function/function.bal";

describe('Edit function', () => {
  beforeEach(() => {
    cy.visit(getIntegrationTestStoryURL(BAL_FILE_PATH))
  })

  it('Edit function', () => {
    Canvas.getFunction("getGreeting")
      .nameShouldBe("getGreeting")
      .edit();

    FunctionForm
      .shouldBeVisible()
      .typeFunctionName("myfunction")
      .typeReturnType("json|error?")
      .save();

    SourceCode.shouldBeEqualTo(
      getCurrentSpecFolder() + "edit-function.expected.bal");
  })
  
  it('Edit function - Edit parameter', () => {
    Canvas.getFunction("getGreeting")
      .nameShouldBe("getGreeting")
      .edit();

    FunctionForm
      .shouldBeVisible()
      .updateParameter("int quantity", "string", "quantity")
      .save();

    SourceCode.shouldBeEqualTo(
      getCurrentSpecFolder() + "edit-function-param.expected.bal");
  })

  it('Edit function - Remove parameter', () => {
    Canvas.getFunction("getGreeting")
      .nameShouldBe("getGreeting")
      .edit();

    FunctionForm
      .shouldBeVisible()
      .removeParameter("int quantity")
      .save();

    SourceCode.shouldBeEqualTo(
      getCurrentSpecFolder() + "edit-function-remove-param.expected.bal");
  })
})
