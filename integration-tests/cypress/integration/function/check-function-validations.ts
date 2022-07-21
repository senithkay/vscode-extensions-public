import { Canvas } from "../../utils/components/canvas";
import { SourceCode } from "../../utils/components/code-view";
import { TopLevelPlusWidget } from "../../utils/components/top-level-plus-widget";
import { getCurrentSpecFolder } from "../../utils/file-utils";
import { FunctionForm } from "../../utils/forms/function-form";
import { getIntegrationTestPageURL } from "../../utils/story-url-utils"

const BAL_FILE_PATH = "function/add-function-to-empty-file.bal";

describe('Add function and statements via Low Code', () => {
  beforeEach(() => {
    cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH))
  })

  it('Check save button for valid and invalid expressions', () => {
    Canvas
      .welcomeMessageShouldBeVisible()
      .clickTopLevelPlusButton();
    TopLevelPlusWidget.clickOption("Function");

    FunctionForm
      .shouldBeVisible()
      .typeFunctionName("myfunction/")
      .saveShouldBeDisabled()
      .typeFunctionName("myfunction")
      .saveShouldBeEnabled()
      .typeReturnType("string|error")
      .saveShouldBeDisabled()
      .typeReturnType("string|error?")
      .saveShouldBeEnabled()
  })

  it('Check add param button for valid and invalid expressions', () => {
    Canvas
        .welcomeMessageShouldBeVisible()
        .clickTopLevelPlusButton();
    TopLevelPlusWidget.clickOption("Function");

    FunctionForm
        .shouldBeVisible()
        .typeFunctionName("myfunction")
        .addParameterClick()
        .paramSaveShouldBeDisabled()
        .typeParamType("int")
        .typeParamName("p1@")
        .paramSaveShouldBeDisabled()
        .typeParamName("p1")
        .paramSaveShouldBeEnabled()
        .typeParamType("String")
        .paramSaveShouldBeDisabled()
        .typeParamType("string")
        .paramSaveShouldBeEnabled()
  })
})
