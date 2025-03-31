/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { test, expect } from '@playwright/test';
import * as path from 'path';
import { clearNotificationAlerts, initVSCode, newProjectPath, page, resourcesFolder, resumeVSCode, vscode } from '../Utils';
import { ConnectorStore } from '../components/ConnectorStore';
import { Diagram } from '../components/Diagram';
import { ServiceDesigner } from '../components/ServiceDesigner';
import { AddArtifact } from '../components/AddArtifact';
import { Form } from '../components/Form';
import { Overview } from '../components/Overview';
const fs = require('fs');

export default function createTests() {
  test.beforeAll(async () => {
    console.log('Starting connector tests')
    await resumeVSCode();
  });
  
  test('Create new API', async () => {
    // wait until window reload
    const overviewPage = new Overview(page.page);
    await overviewPage.init();
    await overviewPage.goToAddArtifact();

    const addArtifactPage = new AddArtifact(page.page);
    await addArtifactPage.init();
    await addArtifactPage.add('API');

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

  test('Service designer', async () => {
    // service designer
    const serviceDesigner = new ServiceDesigner(page.page);
    await serviceDesigner.init();
    const resource = await serviceDesigner.resource('GET', '/');
    await resource.click();
  });

  test('Download connector to modules list', async () => {
    // diagram
    const diagram = new Diagram(page.page, 'Resource');
    await diagram.init();
    await diagram.downloadConnectorThroughModulesList('File');
  });

  test('Add downloaded connector operation to resource', async () => {
    // diagram
    const diagram = new Diagram(page.page, 'Resource');
    await diagram.init();

    await diagram.addConnectorOperation('File', 'createDirectory');

    // create connection through connector form
    await diagram.addNewConnectionFromOperationForm();

    const connectorStore = new ConnectorStore(page.page, "Resource View");
    await connectorStore.init();
    await connectorStore.selectOperation('LOCAL');

    const connectionForm = new Form(page.page, 'Resource View');
    await connectionForm.switchToFormView();
    console.log('Filling out connection form');
    await connectionForm.fill({
      values: {
        'Connection Name*': {
          type: 'input',
          value: 'local_connection',
        },
        'Working Directory': {
          type: 'input',
          value: 'examplefolder/tempfolder/'
        }
      }
    });
    await connectionForm.submit('Add');

    // Fill connector form
    await diagram.init();
    await diagram.fillConnectorForm({
      values: {
        'Directory Path*': {
          type: 'expression',
          value: 'createdDirectory'
        }
      }
    });
  });

  test('Edit connector operation in resource', async () => {
    const diagram = new Diagram(page.page, 'Resource');
    await diagram.init();
    const connector = await diagram.getConnector('file', 'createDirectory');
    await connector.edit({
      values: {
        'Directory Path*': {
          type: 'expression',
          value: 'createdDirectory'
        }
      }
    });
  });

  test('Download module through search', async () => {
    // diagram
    const diagram = new Diagram(page.page, 'Resource');
    await diagram.init();
    await diagram.downloadConnectorThroughSearch('CSV');
  });

  test('Add downloaded module operation to resource', async () => {
    // diagram
    const diagram = new Diagram(page.page, 'Resource');
    await diagram.init();

    await diagram.addConnectorOperation('CSV', 'csvToCsv');

    await clearNotificationAlerts(page);

    // Fill connector form
    await diagram.fillConnectorForm({
      values: {
        'Skip Data Rows': {
          type: 'expression',
          value: '5'
        }
      }
    });
  });

  test('Delete connector', async () => {
    // diagram
    const diagram = new Diagram(page.page, 'Resource');
    await diagram.init();



    await diagram.deleteConnector('CSV');
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

  test.skip('Edit Connector Operation', async () => {
    // Edit connector operation
    const diagram = new Diagram(page.page, 'Resource');
    await diagram.init();
    const connectorNode = await diagram.getConnector('file', 'createDirectory');
    await connectorNode.edit({
      values: {
        'Directory Path*': {
          type: 'expression',
          value: '/Users/exampleUser/Documents/newCreatedDirectories',
        }
      }
    });
  })

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
  })
}
