/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
import { Canvas } from "../../../utils/components/canvas";
import { SourceCode } from "../../../utils/components/code-view";
import { getCurrentSpecFolder } from "../../../utils/file-utils";
import { WhileForm } from "../../../utils/forms/while-form";
import { getIntegrationTestPageURL } from "../../../utils/story-url-utils";

const BAL_FILE_PATH = "block-level/while/add-while-to-function.bal";

describe('Add while to function via Low Code', () => {
  beforeEach(() => {
    cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH))
  })

  it('Add a while to function', () => {
    Canvas.getFunction("sampleFunction")
      .nameShouldBe("sampleFunction")
      .shouldBeExpanded()
      .getDiagram()
      .shouldBeRenderedProperly()
      .getBlockLevelPlusWidget()
      .clickOption("While");

    WhileForm
      .shouldBeVisible()
      .typeCondition("1<5")
      .save()

    SourceCode.shouldBeEqualTo(
      getCurrentSpecFolder() + "add-while-to-function.expected.bal");
  })

  it('Open and Cancel Form', () => {
    Canvas.getFunction("sampleFunction")
      .nameShouldBe("sampleFunction")
      .shouldBeExpanded()
      .getDiagram()
      .shouldBeRenderedProperly()
      .getBlockLevelPlusWidget()
      .clickOption("While");

    WhileForm
      .shouldBeVisible()
      .cancel();

  });

  it('Open and Cancel Form', () => {
    Canvas.getFunction("sampleFunction")
      .nameShouldBe("sampleFunction")
      .shouldBeExpanded()
      .getDiagram()
      .shouldBeRenderedProperly()
      .getBlockLevelPlusWidget()
      .clickOption("While");

    WhileForm
      .shouldBeVisible()
      .close();

  });

})
