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
import { TopLevelPlusWidget } from "../../../utils/components/top-level-plus-widget";
import { getCurrentSpecFolder } from "../../../utils/file-utils";
import { ConnectorForm } from "../../../utils/forms/connector-form";
import { DemoConnectorForm } from "../../../utils/forms/connectors/demo-connector-form";
import { EndpointListForm } from "../../../utils/forms/endpoint-list-form";
import { getIntegrationTestPageURL } from "../../../utils/story-url-utils";

const BAL_FILE_PATH = "block-level/connector/add-connector-to-function.bal";

describe('Add Demo connectors two via Low Code', {
  defaultCommandTimeout: 60 * 1000
}, () => {
  beforeEach(() => {
    cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH));
    cy.exec('bal pull lowcodedemo/democonnector.two', { failOnNonZeroExit: false }).then((result) => {
      cy.log('Package pull results: ' + JSON.stringify(result));
    });
    DiagramElement.resetGlobalIndexes();
  });

  it('Add a global endpoint and operations', () => {
    let stmtLine = 1;

    Canvas.clickTopLevelPlusButton(0);

    TopLevelPlusWidget.clickOption("Connector");

    ConnectorForm
      .shouldBeVisible()
      .waitForConnectorsLoading()
      .searchConnector("democonnector")
      .waitForConnectorsLoading()
      .selectConnector("demo connector two");

    DemoConnectorForm
      .shouldBeVisible()
      .waitForConnectorLoad()
      .haveDefaultName("twoEndpoint")
      .typeEndpointName("twoEp")
      .typeInField("token", `"abcdefg1234"`)
      .saveConnection();

    DiagramElement.isModuleVarExists("twoEp");

    Canvas.getFunction("myfunction")
      .nameShouldBe("myfunction")
      .shouldBeExpanded()
      .getDiagram()
      .shouldBeRenderedProperly()
      .getBlockLevelPlusWidget()
      .clickOption("Action");

    EndpointListForm
      .shouldBeVisible()
      .selectEndpoint("twoEp");

    DemoConnectorForm
      .shouldBeVisible()
      .waitForConnectorLoad()
      .selectOperation("getMessage")
      .save();

    DiagramElement.isActionExists("getMessage", "getMessageResponse");

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
      .selectEndpoint("twoEp");

    DemoConnectorForm
      .shouldBeVisible()
      .waitForConnectorLoad()
      .selectOperation("readMessage")
      .typeInField("Item", "11")
      .clickAddItem()
      .typeInField("Item", "22")
      .clickAddItem()
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
      .selectEndpoint("twoEp");

    DemoConnectorForm
      .shouldBeVisible()
      .waitForConnectorLoad()
      .selectOperation("sendMessage")
      .typeInField("msgList Key", `"key1"`)
      .typeInField("msgList Value", `"value1"`)
      .clickAddMapItem()
      .typeInField("username", `"user"`)
      .typeInField("password", `"pass"`)
      .save();

    DiagramElement.isActionExists("sendMessage", "sendMessageResponse");

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
      .selectEndpoint("twoEp");

    DemoConnectorForm
      .shouldBeVisible()
      .waitForConnectorLoad()
      .selectOperation("viewMessage")
      .typeInField("id", "123")
      .typeInField("name", `"user"`)
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
      .selectEndpoint("twoEp");

    DemoConnectorForm
      .shouldBeVisible()
      .waitForConnectorLoad()
      .selectOperation("updateMessage")
      .typeInField("id", "123", 0)
      .typeInField("body", `"sample text message"`)
      .typeInField("id", "456", 1)
      .typeInField("name", `"user456"`, 0)
      .typeInField("id", "789", 2)
      .typeInField("name", `"user789"`, 1)
      .save();

    DiagramElement.isActionExists("updateMessage", "updateMessageResponse");

    SourceCode.shouldBeEqualTo(
      getCurrentSpecFolder() + "demo-con-two-expected.bal.bal");
  });
});
