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
import { DiagramElement } from "../../../utils/components/diagram-element";
import { getCurrentSpecFolder } from "../../../utils/file-utils";
import { ConnectorForm } from "../../../utils/forms/connector-form";
import { DemoConnectorForm } from "../../../utils/forms/connectors/demo-connector-form";
import { EndpointListForm } from "../../../utils/forms/endpoint-list-form";
import { FunctionForm } from "../../../utils/forms/function-form";
import { getIntegrationTestPageURL } from "../../../utils/story-url-utils";

const BAL_FILE_PATH = "block-level/connector/add-connector-to-function.bal";

describe('Add Demo connectors three via Low Code', {
  defaultCommandTimeout: 60 * 1000
}, () => {
  beforeEach(() => {
    cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH));
    cy.exec('bal pull lowcodedemo/democonnector.three', { failOnNonZeroExit: false }).then((result) => {
      cy.log('Package pull results: ' + JSON.stringify(result));
    });
    DiagramElement.resetGlobalIndexes();
  });

  it('Add function parameter endpoint and operations', () => {
    let stmtLine = 1;
    Canvas.getFunction("myfunction")
      .nameShouldBe("myfunction")
      .shouldBeExpanded()
      .getDiagram()
      .shouldBeRenderedProperly()
      .getBlockLevelPlusWidget()
      .clickOption("Connector");

    ConnectorForm
      .shouldBeVisible()
      .waitForConnectorsLoading()
      .searchConnector("democonnector")
      .waitForConnectorsLoading()
      .selectConnector("demo connector three");

    DemoConnectorForm
      .shouldBeVisible()
      .waitForConnectorLoad()
      .haveDefaultName("threeEndpoint")
      .typeEndpointName("threeEpLocal")
      .typeInField("username", `"user123"`)
      .typeInField("password", `"pass"`)
      .typeInField("id", "123")
      .typeInField("name", `"user"`)
      .saveConnection();

    DiagramElement.isEndpointExists("threeEpLocal");

    // update function parameter with endpoint
    Canvas.getFunction("myfunction")
      .nameShouldBe("myfunction")
      .edit();

    FunctionForm
      .shouldBeVisible()
      .addParameter("three:Client", "threeEpParam")
      .save();

    Canvas.getFunction("myfunction")
      .nameShouldBe("myfunction")
      .shouldBeExpanded()
      .getDiagram()
      .shouldBeRenderedProperly()
      .clickDefaultWorkerPlusBtn(stmtLine++)
      .getBlockLevelPlusWidget()
      .clickOption("Action", true);

    EndpointListForm
      .shouldBeVisible()
      .selectEndpoint("threeEpLocal");

    DemoConnectorForm
      .shouldBeVisible()
      .waitForConnectorLoad()
      .selectOperation("getStudents")
      .save();

    DiagramElement.isActionExists("getStudents", "getStudentsResponse");

    Canvas.getFunction("myfunction")
      .nameShouldBe("myfunction")
      .shouldBeExpanded()
      .getDiagram()
      .shouldBeRenderedProperly()
      .clickDefaultWorkerPlusBtn(stmtLine++)
      .getBlockLevelPlusWidget()
      .clickOption("Action", true);

    EndpointListForm
      .shouldBeVisible()
      .selectEndpoint("threeEpParam");

    DemoConnectorForm
      .shouldBeVisible()
      .waitForConnectorLoad()
      .selectOperation("searchMessage")
      .typeInField("msg", `"test message"`)
      .save();

    DiagramElement.isActionExists("searchMessage", "searchMessageResponse");

    SourceCode.shouldBeEqualTo(
      getCurrentSpecFolder() + "demo-con-three-expected.bal.bal");
  });

});
