/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { test, expect } from '@playwright/test';
import { Form } from './components/Form';
import { AddArtifact } from './components/AddArtifact';
import { ServiceDesigner } from './components/ServiceDesigner';
import { Diagram } from './components/Diagram';
import { clearNotificationAlerts, initTest, page } from './Utils';
import { ConnectorStore } from './components/ConnectorStore';

export default function createTests() {
  test.describe(async () => {
    initTest("Diagram", true);

    test("Diagram Tests", async () => {
      test.skip('Create new API', async () => {

        // wait until window reload
        // await page.page.waitForSelector('iframe.webview.ready', { state: 'detached' })
        // page = new ExtendedPage(await vscode!.firstWindow());
        // await page.waitUntilExtensionReady();

        const overviewPage = new AddArtifact(page.page);
        await overviewPage.init();
        await overviewPage.add('API');

        const apiForm = new Form(page.page, 'API Form');
        await apiForm.switchToFormView();
        await apiForm.fill({
          values: {
            'Name*': {
              type: 'input',
              value: 'api1',
            },
            'Context*': {
              type: 'input',
              value: '/api1',
            },
          }
        });
        await apiForm.submit();
      });

      test.skip('Service designer', async () => {
        // service designer
        const serviceDesigner = new ServiceDesigner(page.page);
        await serviceDesigner.init();
        const resource = await serviceDesigner.resource('GET', '/');
        await resource.click();
      });

      test.skip('Add mediator in to resource', async () => {
        // diagram
        const diagram = new Diagram(page.page, 'Resource');
        await diagram.init();
        await diagram.addMediator('Log');
      });

      test.skip('Edit mediator in resource', async () => {
        const diagram = new Diagram(page.page, 'Resource');
        await diagram.init();
        const mediator = await diagram.getMediator('log');
        await mediator.edit({
          values: {
            'Log Category': {
              type: 'combo',
              value: 'DEBUG',
            },
            'Log Separator': {
              type: 'input',
              value: ' - ',
            },
            'Description': {
              type: 'input',
              value: 'log mediator',
            }
          }
        });
        expect(await mediator.getDescription()).toEqual('log mediator');

      });

      test.skip('Add new connection', async () => {
        // Add connection from side panel
        const diagram = new Diagram(page.page, 'Resource');
        await diagram.init();
        await diagram.addNewConnection(1);

        const connectorStore = new ConnectorStore(page.page, 'Resource View');
        await connectorStore.init();
        await connectorStore.selectOperation('File');

        const connectionForm = new Form(page.page, 'Resource View');
        await connectionForm.switchToFormView();
        await connectionForm.fill({
          values: {
            'Connection Name*': {
              type: 'input',
              value: 'file_connection',
            },
            'Host*': {
              type: 'input',
              value: 'example.com',
            },
            'Port*': {
              type: 'input',
              value: '80',
            },
            'User Directory Is Root': {
              type: 'combo',
              value: 'true',
            },
            'TrustStore Path*': {
              type: 'expression',
              value: 'exampletruststore.com',
            },
            'TrustStore Password*': {
              type: 'expression',
              value: 'examplePassword@123',
            }
          }
        });
        await clearNotificationAlerts(page);
        await connectionForm.submit('Add');
        expect(await diagram.verifyConnection("file_connection", "File - FTPS Connection")).toBeTruthy();
        await diagram.closeSidePanel();
      });

      test.skip('Edit Connector Operation Generated From Templates', async () => {
        // Edit connector operation generated from templates
        const diagram = new Diagram(page.page, 'Resource');
        await diagram.init();
        const connectorNode = await diagram.getConnector('ldap', 'addEntry');
        await connectorNode.edit({
          values: {
            'attributes': {
              type: 'expression',
              value: 'att',
            }
          }
        });
      });
    });
  });
}
