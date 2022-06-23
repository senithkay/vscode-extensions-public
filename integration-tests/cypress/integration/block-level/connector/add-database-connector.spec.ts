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
import { getIntegrationTestPageURL } from "../../../utils/story-url-utils";
import { ConnectorForm } from "../../../utils/forms/connector-form";
import { MysqlForm } from "../../../utils/forms/connectors/mysql-form";
import { TopLevelPlusWidget } from "../../../utils/components/top-level-plus-widget";
import { EndpointListForm } from "../../../utils/forms/endpoint-list-form";
import { DiagramElement } from "../../../utils/components/diagram-element";

const BAL_FILE_PATH = "block-level/connector/add-database-connector.bal";

describe('Add a database connector', () => {
  beforeEach(() => {
    cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH));
    cy.exec('bal pull ballerinax/mysql', { failOnNonZeroExit: false }).then((result) => {
      cy.log('Package pull results: ' + JSON.stringify(result));
    });
    DiagramElement.resetGlobalIndexes();
  });

  it('Add a database connector into a resource', {
    defaultCommandTimeout: 60 * 1000,
  }, () => {

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
      .searchConnector("mysql")
      .waitForConnectorsLoading()
      .selectConnector("mysql / client");

    MysqlForm
      .shouldBeVisible()
      .waitForConnectorLoad()
      .haveDefaultName()
      .typeConnectionName("dbcon")
      .typeDatabase("testdb")
      .continueToInvoke()
      .selectOperation("query")
      .addSqlQuery("SELECT * FROM uses;")
      .save();

    DiagramElement.isEndpointExists("dbcon");
    DiagramElement.isActionExists("query", "queryResponse");

    SourceCode.shouldBeEqualTo(
      getCurrentSpecFolder() + "add-database-connector-in-resource-level.expected.bal");
  });

  it('Add a database connector at module level', {
    defaultCommandTimeout: 60 * 1000,
  }, () => {
    Canvas.clickTopLevelPlusButton(2);

    TopLevelPlusWidget.clickOption("Connector");

    ConnectorForm
      .shouldBeVisible()
      .waitForConnectorsLoading()
      .searchConnector("mysql")
      .waitForConnectorsLoading()
      .selectConnector("mysql / client");

    MysqlForm
      .shouldBeVisible()
      .waitForConnectorLoad()
      .togglePublicAccessModifier()
      .isAccessModifierChecked("public")
      .toggleFinalAccessModifier()
      .isAccessModifierChecked("public,final")
      .haveDefaultName()
      .typeConnectionName("dbcon")
      .typeDatabase("testdb")
      .saveConnection();

    DiagramElement.isModuleVarExists("dbcon");

    Canvas.getService("/hello")
      .getResourceFunction("GET", "/")
      .getDiagram()
      .shouldBeRenderedProperly()
      .getBlockLevelPlusWidget()
      .clickOption("Action");

    EndpointListForm
      .shouldBeVisible()
      .selectEndpoint("dbcon");

    MysqlForm
      .shouldBeVisible()
      .waitForConnectorLoad()
      .selectOperation("query")
      .addSqlQuery("SELECT * FROM uses;")
      .save();

    DiagramElement.isActionExists("query", "queryResponse");

    SourceCode.shouldBeEqualTo(
      getCurrentSpecFolder() + "add-database-connector-in-module-level.expected.bal");
  });
});
