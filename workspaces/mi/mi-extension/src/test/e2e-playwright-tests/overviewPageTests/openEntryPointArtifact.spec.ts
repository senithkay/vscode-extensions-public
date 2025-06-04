/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { test } from '@playwright/test';
import { ProjectExplorer } from "../components/ProjectExplorer";
import { EventIntegration } from "../components/ArtifactTest/EventIntegration";
import { Overview } from '../components/Overview';
import { API } from '../components/ArtifactTest/APITests';
import { Automation } from "../components/ArtifactTest/Automation";
import { initTest, page} from '../Utils';

export default function createTests() {
    test.describe("View Artifact Tests", {
        tag: '@group2',
    }, async () => {
        initTest();

        test('View Artifact Tests', async ({ }) => {
            await test.step('API Diagram Rendering Test', async () => {
                console.log('Starting API Diagram Rendering Test');
                const projectExplorer = new ProjectExplorer(page.page);
                await projectExplorer.goToOverview("testProject");
                console.log('Navigated to project overview');
                const api = new API(page.page);
                await api.init();
                await api.addAPI('helloWorld', "/helloWorld");
                console.log('API added successfully');
                const explorer = new ProjectExplorer(page.page);
                await explorer.goToOverview("testProject");
                const overviewPage = new Overview(page.page);
                await overviewPage.init();
                console.log('Clicking on diagram view for helloWorld API');
                await overviewPage.clickOnDiagramView('helloWorldAPI');
            });

            await test.step('Auotomation Diagram Rendering Test', async () => {
                console.log('Starting Automation Diagram Rendering Test');
                const automation = new Automation(page.page);
                await automation.init();
                await automation.add('TestTask');
                console.log('Automation added successfully');
                const projectExplorer = new ProjectExplorer(page.page);
                await projectExplorer.goToOverview("testProject");
                const overviewPage = new Overview(page.page);
                await overviewPage.init();
                console.log('Clicking on diagram view for TestTask Automation');
                await overviewPage.clickOnDiagramView('Automation')
            });

            await test.step('Event Integration Diagram Rendering Test', async () => {
                console.log('Starting Event Integration Diagram Rendering Test');
                const eventIntegration = new EventIntegration(page.page);
                await eventIntegration.init();
                await eventIntegration.add('HttpEventIntegration');
                console.log('Event Integration added successfully');
                const projectExplorer = new ProjectExplorer(page.page);
                await projectExplorer.goToOverview("testProject");
                const overviewPage = new Overview(page.page);
                await overviewPage.init();
                console.log('Clicking on diagram view for HttpEventIntegration');
                await overviewPage.clickOnDiagramView('Event Integration')
            });
        });
    });
}
