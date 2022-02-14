import { Canvas } from "../../utils/components/canvas"
import { SourceCode } from "../../utils/components/code-view"
import { TopLevelPlusWidget } from "../../utils/components/top-level-plus-widget"
import { getCurrentSpecFolder } from "../../utils/file-utils"
import { HttpForm } from "../../utils/forms/connectors/http-form"
import { LogForm } from "../../utils/forms/log-form"
import { ResourceForm } from "../../utils/forms/resource-form"
import { ServiceForm } from "../../utils/forms/service-form"
import { VariableFormBlockLevel } from "../../utils/forms/variable-form-block-level"
import { getIntegrationTestStoryURL } from "../../utils/story-url-utils"

describe('edit a http service', () => {
  beforeEach(() => {
    cy.visit(getIntegrationTestStoryURL("service/edit-existing-service-file.bal"))
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
      .save();

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
      .save();

    SourceCode.shouldBeEqualTo(
      getCurrentSpecFolder() + "edit-service-http.expected.bal");

  })

})
