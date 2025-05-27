/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { test, expect } from '@playwright/test';
import { Form } from '../components/Form';
import { AddArtifact } from '../components/AddArtifact';
import { ConnectorStore } from '../components/ConnectorStore';
import { initTest, page } from '../Utils';
import { ProjectExplorer } from '../components/ProjectExplorer';
import { MACHINE_VIEW } from '@wso2-enterprise/mi-core';
import { Overview } from '../components/Overview';

export default function createTests() {
    test.describe("Connection Tests", {
        tag: '@group2',
    }, async () => {
        initTest();

        test("Connection Tests", async ({ }, testInfo) => {
            const testAttempt = testInfo.retry + 1;
            await test.step('Create new Connection', async () => {
                console.log('Initializing AddArtifact page for connection creation');

                const { title: iframeTitle } = await page.getCurrentWebview();

                if (iframeTitle === MACHINE_VIEW.Overview) {
                    const overviewPage = new Overview(page.page);
                    await overviewPage.init();
                    await overviewPage.goToAddArtifact();
                }

                const addArtifactPage = new AddArtifact(page.page);
                await addArtifactPage.init();
                await addArtifactPage.add('Connections');

                const connectorStore = new ConnectorStore(page.page, "Connector Store Form");
                await connectorStore.init();
                console.log('Searching for Email connector');
                await connectorStore.search('Email');
                await connectorStore.selectOperation('IMAP');
                await connectorStore.confirmDownloadDependency();

                const connectionForm = new Form(page.page, 'Connector Store Form');
                await connectionForm.switchToFormView();
                console.log('Filling out connection form');
                await connectionForm.fill({
                    values: {
                        'Connection Name*': {
                            type: 'input',
                            value: 'email_connection' + testAttempt,
                        },
                        'Host*': {
                            type: 'expression',
                            value: 'http://localhost'
                        },
                        'Port*': {
                            type: 'expression',
                            value: '80',
                        },
                        'Username*': {
                            type: 'expression',
                            value: 'exampleusername'
                        }
                    }
                });
                await connectionForm.submit('Add');

                console.log('Finding created connection in Project Explorer');
                const projectExplorer = new ProjectExplorer(page.page);
                await projectExplorer.findItem(["Project testProject", "Other Artifacts", "Connections", "email_connection" + testAttempt]);
            });

            await test.step('Edit Connection', async () => {
                console.log('Editing connection: email_connection');
                const projectExplorer = new ProjectExplorer(page.page);
                console.log('Finding existing connection in Project Explorer');
                await projectExplorer.findItem(["Project testProject", "Other Artifacts", "Connections", "email_connection" + testAttempt], true);

                const connectionForm = new Form(page.page, 'Connection Creation Form');
                await connectionForm.switchToFormView();
                const connectionName = await connectionForm.getInputValue('Connection Name*');
                console.log(`Current connection name is: ${connectionName}`);
                expect(connectionName).toBe('email_connection' + testAttempt);

                console.log('Filling out the connection form with new values');
                await connectionForm.fill({
                    values: {
                        'Connection Name*': {
                            type: 'input',
                            value: 'email_connection2' + testAttempt,
                        },
                        'Host*': {
                            type: 'expression',
                            value: 'example2.com',
                        },
                        'Port*': {
                            type: 'expression',
                            value: '8080',
                        }
                    }
                });
                await connectionForm.submit('Update');
            });

            await test.step('Create Connection from project explorer', async () => {
                console.log('Creating Connection from project explorer: http_connection');
                const projectExplorer = new ProjectExplorer(page.page);
                console.log('Click connection + in Project Explorer');
                await projectExplorer.addArtifact(["Project testProject", "Other Artifacts", "Connections"]);

                const connectorStore = new ConnectorStore(page.page, "Connector Store Form");
                await connectorStore.init();
                await connectorStore.search('HTTP');
                await connectorStore.selectOperation('HTTP');

                const connectionForm = new Form(page.page, 'Connector Store Form');
                await connectionForm.switchToFormView();
                console.log('Filling out connection form');
                await connectionForm.fill({
                    values: {
                        'Connection Name*': {
                            type: 'input',
                            value: 'http_connection' + testAttempt,
                        }
                    }
                });
                await connectionForm.submit('Add');

                console.log('Finding created connection in Project Explorer');
                await projectExplorer.findItem(["Project testProject", "Other Artifacts", "Connections", "http_connection" + testAttempt]);
            });

            // ToDo: Uncomment the following section to test importing a connector
            // await test.step('Import Connector', async () => {
            //     console.log('Importing connector: bookservice');
            //     const overviewPage = new Overview(page.page);
            //     await overviewPage.init();
            //     await overviewPage.goToAddArtifact();

            //     const addArtifactPage = new AddArtifact(page.page);
            //     await addArtifactPage.init();
            //     await addArtifactPage.add('Connections');

            //     const connectorStore = new ConnectorStore(page.page, "Connector Store Form");
            //     await connectorStore.init();

            //     console.log('importing connector');
            //     await connectorStore.importConnector('bookservice-1.0.0.zip', true);

            //     await connectorStore.search('Bookservice');
            //     await connectorStore.selectOperation('BOOKSERVICE');

            //     const connectionForm = new Form(page.page, 'Connector Store Form');
            //     await connectionForm.switchToFormView();
            //     console.log('Filling out connection form');
            //     await connectionForm.fill({
            //         values: {
            //             'Connection Name*': {
            //                 type: 'input',
            //                 value: 'bookservice_connection' + testAttempt,
            //             },
            //             'Server URL*': {
            //                 type: 'expression',
            //                 value: 'http://localhost'
            //             },
            //             'Port*': {
            //                 type: 'expression',
            //                 value: '80',
            //             }
            //         }
            //     });
            //     await connectionForm.submit('Add');
            //     const projectExplorer = new ProjectExplorer(page.page);
            //     await projectExplorer.findItem(["Project testProject", "Other Artifacts", "Connections", "bookservice_connection" + testAttempt]);

            //     console.log('Connection tests completed');
            // });
        });
    });
}
