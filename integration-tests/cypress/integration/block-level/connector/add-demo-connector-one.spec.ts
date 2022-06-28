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
import { getIntegrationTestPageURL } from "../../../utils/story-url-utils";

const BAL_FILE_PATH = "block-level/connector/add-connector-to-function.bal";

describe('Add Demo connectors one via Low Code', {
  defaultCommandTimeout: 60 * 1000
}, () => {
  beforeEach(() => {
    cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH));
    cy.exec('bal pull lowcodedemo/democonnector.one', { failOnNonZeroExit: false }).then((result) => {
      cy.log('Package pull results: ' + JSON.stringify(result));
    });
    DiagramElement.resetGlobalIndexes();
  });

  it('Add local endpoint and operations', () => {
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
      .selectConnector("demo connector one");

    DemoConnectorForm
      .shouldBeVisible()
      .waitForConnectorLoad()
      .haveDefaultName("oneEndpoint")
      .typeEndpointName("oneEp")
      .continueToInvoke()
      .selectOperation("getMessage")
      .save();

    DiagramElement.isEndpointExists("oneEp");
    DiagramElement.isActionExists("getMessage", "getMessageResponse");

    stmtLine++;

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
      .selectEndpoint("oneEp");

    DemoConnectorForm
      .shouldBeVisible()
      .waitForConnectorLoad()
      .selectOperation("readMessage")
      .typeInField("id", "123")
      .typeInField("fq", "123.4")
      .typeInField("point", "123.45")
      .typeInField("bool", "false")
      .save();

    DiagramElement.isActionExists("readMessage", "readMessageResponse");

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
      .selectEndpoint("oneEp");

    DemoConnectorForm
      .shouldBeVisible()
      .waitForConnectorLoad()
      .selectOperation("sendMessage")
      .typeInField("msg", `"test message"`)
      .save();

    DiagramElement.isActionExists("sendMessage");

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
      .selectEndpoint("oneEp");

    DemoConnectorForm
      .shouldBeVisible()
      .waitForConnectorLoad()
      .selectOperation("viewMessage")
      .typeInField("id", "123")
      .save();

    DiagramElement.isActionExists("viewMessage", "viewMessageResponse");

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
      .selectEndpoint("oneEp");

    DemoConnectorForm
      .shouldBeVisible()
      .waitForConnectorLoad()
      .selectOperation("testKeyword")
      .typeInField("'client", "1234")
      .typeInField("order", "5678")
      .typeInField("amount", "200.50")
      .typeInField("note", `"test note"`)
      .save();

    DiagramElement.isActionExists("testKeyword", "testKeywordResponse");

    SourceCode.shouldBeEqualTo(
      getCurrentSpecFolder() + "demo-con-one-expected.bal.bal");
  });

});
