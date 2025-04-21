/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { test } from '@playwright/test';
import { Overview } from '../components/Overview';
import path from "path";
import { initTest, page, waitUntilPomContains, waitUntilPomNotContains } from '../Utils';
const dataFolder = path.join(__dirname, '..', 'data');
export const newProjectPath = path.join(dataFolder, 'new-project', 'testProject');
export const pomFilePath = path.join(newProjectPath, 'testProject', 'pom.xml');
export const configFilePath = path.join(newProjectPath, 'testProject', 'src', 'main', 'wso2mi', 'resources', 'conf', 'config.properties');

export default function createTests() {
    test.describe("Project Settings tests", {
        tag: '@group2',
    }, async () => {
        initTest();

        test('Project Summary Page Tests', async ({ }) => {
            await test.step('Create new API', async () => {
                'Get Project Summary Page'
                const overviewPage = new Overview(page.page);
                await overviewPage.init();
                await overviewPage.getProjectSummary();
            });

            await test.step('Update Project Version', async () => {
                const overviewPage = new Overview(page.page);
                await overviewPage.init();
                await overviewPage.updateProjectVersion("1.1.0");
                await overviewPage.getProjectSummary();
                await waitUntilPomContains(page.page, pomFilePath, '<version>1.1.0</version>');
                await overviewPage.updateProjectVersion("1.0.0");
            });

            await test.step('Add Other Dependencies', async () => {
                const overviewPage = new Overview(page.page);
                await waitUntilPomNotContains(page.page, pomFilePath, '<artifactId>mysql-connector-java</artifactId>');
                await overviewPage.init();
                await overviewPage.addOtherDependencies();
                await waitUntilPomContains(page.page, pomFilePath, '<artifactId>mysql-connector-java</artifactId>')
            });

            await test.step('Update Other Dependencies', async () => {
                const overviewPage = new Overview(page.page);
                await waitUntilPomNotContains(page.page, pomFilePath, '<artifactId>mysql-connector--java</artifactId>');
                await overviewPage.init();
                await overviewPage.editOtherDependencies();
                await waitUntilPomContains(page.page, pomFilePath, '<artifactId>mysql-connector--java</artifactId>');
            });

            await test.step('Delete Other Dependencies', async () => {
                const overviewPage = new Overview(page.page);
                await overviewPage.init();
                await overviewPage.deleteOtherDependencies();
                await waitUntilPomNotContains(page.page, pomFilePath, '<artifactId>mysql-connector--java</artifactId>');
            });

            await test.step('Add Connector Dependencies', async () => {
                await waitUntilPomNotContains(page.page, pomFilePath,
                    '<artifactId>mi-connector-amazonsqs</artifactId>');
                const overviewPage = new Overview(page.page);
                await overviewPage.init();
                await overviewPage.addConnectorDependencies();
                await waitUntilPomContains(page.page, pomFilePath, '<artifactId>mi-connector-amazonsqs</artifactId>');
            });

            await test.step('Update Connector Dependencies', async () => {
                await waitUntilPomNotContains(page.page, pomFilePath, '<artifactId>mi-connector--amazonsqs</artifactId>');
                const overviewPage = new Overview(page.page);
                await overviewPage.init();
                await overviewPage.editConnectorDependencies();
                await waitUntilPomContains(page.page, pomFilePath, '<artifactId>mi-connector--amazonsqs</artifactId>');
            });

            await test.step('Delete Connector Dependencies', async () => {
                const overviewPage = new Overview(page.page);
                await overviewPage.init();
                await overviewPage.deleteConnectorDependencies();
                await waitUntilPomNotContains(page.page, pomFilePath, '<artifactId>mi-connector--amazonsqs</artifactId>');
            });

            await test.step('Add Config', async () => {
                await waitUntilPomNotContains(page.page, configFilePath, 'test_name:string');
                const overviewPage = new Overview(page.page);
                await overviewPage.init();
                await overviewPage.addConfig();
                await waitUntilPomContains(page.page, configFilePath, 'test_name:string');
            });

            await test.step('Edit Config', async () => {
                const overviewPage = new Overview(page.page);
                await overviewPage.init();
                await overviewPage.editConfig();
                await waitUntilPomContains(page.page, configFilePath, 'test_name:cert');
            });

            await test.step('Delete Config', async () => {
                const overviewPage = new Overview(page.page);
                await overviewPage.init();
                await overviewPage.deleteConfig();
                await waitUntilPomNotContains(page.page, configFilePath, 'test_name:cert');
            });
        });
    });
}
