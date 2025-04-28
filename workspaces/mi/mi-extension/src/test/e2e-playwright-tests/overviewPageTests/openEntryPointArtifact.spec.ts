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
    test.describe(async () => {
        initTest();

        test('View Artifact Tests', async ({ }) => {
            await test.step('API Diagram Rendering Test', async () => {
                const projectExplorer = new ProjectExplorer(page.page);
                await projectExplorer.goToOverview("testProject");
                const overview = new Overview(page.page);
                await overview.init();
                await overview.goToAddArtifact();
                const api = new API(page.page);
                await api.init();
                await api.addAPI('helloWorld', "/helloWorld");
                const explorer = new ProjectExplorer(page.page);
                await explorer.goToOverview("testProject");
                const overviewPage = new Overview(page.page);
                await overviewPage.init();
                await overviewPage.clickOnDiagramView('helloWorld');
            });

            await test.step('Auotomation Diagram Rendering Test', async () => {
                const automation = new Automation(page.page);
                await automation.init();
                await automation.add('TestTask');
                const projectExplorer = new ProjectExplorer(page.page);
                await projectExplorer.goToOverview("testProject");
                const overviewPage = new Overview(page.page);
                await overviewPage.init();
                await overviewPage.clickOnDiagramView('TestTask')
            });

            await test.step('Event Integration Diagram Rendering Test', async () => {
                const eventIntegration = new EventIntegration(page.page);
                await eventIntegration.init();
                await eventIntegration.add('HttpEventIntegration');
                const projectExplorer = new ProjectExplorer(page.page);
                await projectExplorer.goToOverview("testProject");
                const overviewPage = new Overview(page.page);
                await overviewPage.init();
                await overviewPage.clickOnDiagramView('HttpEventIntegration')
            });
        });
    });
}
