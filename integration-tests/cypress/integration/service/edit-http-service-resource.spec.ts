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

const BAL_FILE_PATH = "service/edit-existing-resource-file.bal";

describe('edit a http advanced resource', () => {
  beforeEach(() => {
    cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH))
  })

  it('Edit service and add statements', () => {

    cy.on('uncaught:exception', () => false); //Need to fix this

    Canvas.getService("/wso2")
      .getResourceFunction("GET", "path1/path2")
      .editDiagram();

    ResourceForm
      .shouldBeVisible()
      .selectAdvancedConfig()
      .removePathParam("path1")
      .removePathParam("path2")
      .clickAddPathSegments()
      .addPathParam("path3")
      .clickPathParam("path3")
      .typePathParam("p3")
      .clickIsParam()
      .typePathParamType("int")
      .savePathParamBtn()
      .removeQueryParam("query")
      .clickAddQueryParam()
      .addQueryParam("query2")
      .clickQueryParam("query2")
      .typeQueryParamType("int")
      .addQueryParam("q3")
      .togglePayload()
      .clickCallerCheckBox()
      .clickRequestCheckBox()
      .save()

    SourceCode.shouldBeEqualTo(
      getCurrentSpecFolder() + "edit-http-service-resource.expected.bal");
  })

})
