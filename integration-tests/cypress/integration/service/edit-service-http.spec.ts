import { Canvas } from "../../utils/components/canvas"
import { SourceCode } from "../../utils/components/code-view"
import { TopLevelPlusWidget } from "../../utils/components/top-level-plus-widget"
import { getCurrentSpecFolder } from "../../utils/file-utils"
import { HttpForm } from "../../utils/forms/connectors/http-form"
import { LogForm } from "../../utils/forms/log-form"
import { ResourceForm } from "../../utils/forms/resource-form"
import { ServiceForm } from "../../utils/forms/service-form"
import { VariableFormBlockLevel } from "../../utils/forms/variable-form-block-level"
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
      .getBlockLevelPlusWidget()
      .clickOption("Variable");

    VariableFormBlockLevel.shouldBeVisible()
      .typeVariableType("int")
      .typeVariableName("foo")
      .isInitializeVariable()
      .toggleInitializeVariable()
      .valueExpressionShouldBeHidden()
      .toggleInitializeVariable()
      .typeVariableValue(123)
      .save()
      .waitForDiagramUpdate();

    Canvas.getService("/hello")
      .getResourceFunction("POST", "/")
      .getDiagram()
      .shouldBeRenderedProperly()
      .clickDefaultWorkerPlusBtn(1)
      .getBlockLevelPlusWidget()
      .clickOption("Variable");

    VariableFormBlockLevel.shouldBeVisible()
      .typeVariableType("string")
      .typeVariableName("foo_string")
      .isInitializeVariable()
      .toggleInitializeVariable()
      .valueExpressionShouldBeHidden()
      .save()
      .waitForDiagramUpdate();

    SourceCode.shouldBeEqualTo(
      getCurrentSpecFolder() + "edit-service-http.expected.bal");

  })

})
