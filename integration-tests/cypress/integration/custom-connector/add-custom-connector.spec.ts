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
import { getCurrentSpecFolder } from "../../utils/file-utils"
import { CustomConnectorForm } from "../../utils/forms/custom-connector-form"
import { getIntegrationTestStoryURL } from "../../utils/story-url-utils"
import { ConnectorForm } from "../../utils/forms/connector-form";

describe('add a custom connector to a service', () => {
  beforeEach(() => {
    cy.visit(getIntegrationTestStoryURL("custom-connector/add-custom-connector-to-service-file.bal"))
  })

  it('Add a custom connector to a service', () => {
    Canvas.getService("/hello")
      .getResourceFunction("POST", "/")
      .expand()
      .getDiagram()
      .shouldBeRenderedProperly()
      .getBlockLevelPlusWidget()
      .clickOption("Connector");

    ConnectorForm
      .shouldBeVisible()
      .waitForConnectorsLoading()
      .searchConnector("testrestapicomponent")
      .waitForConnectorsLoading()
      .selectConnector("testrestapicomponent");

    CustomConnectorForm
      .shouldBeVisible()
      .waitForConnectorLoad()
      .typeClientId("\"testClientId\"")
      .typeClientSecret("\"testClientSecret\"")
      .saveConnection();

    SourceCode.shouldBeEqualTo(
      getCurrentSpecFolder() + "add-custom-connector.expected.bal");
  })

})
