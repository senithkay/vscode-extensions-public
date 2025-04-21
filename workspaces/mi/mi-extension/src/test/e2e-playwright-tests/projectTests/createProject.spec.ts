/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { test } from '@playwright/test';
import { Welcome } from "./../components/Welcome";
import { Api } from "./../components/ArtifactTest/Api";
import { ProjectExplorer } from "./../components/ProjectExplorer";
import { Overview } from "./../components/Overview";
import { assertFileContent, initTest } from '../Utils';
import { createProject, page} from '../Utils';
import path from "path";
const dataFolder = path.join( __dirname, '..', 'data');
export const newProjectPath = path.join(dataFolder, 'new-project', 'testProject');

export default function createTests() {
    test.describe(async () => {
        initTest(true, true, true);

        test("Create Project Tests", async () => {
            await test.step('Create New Project Tests', async () => {
                await createProject(page, 'newProject', '4.4.0');
                assertFileContent(path.join(newProjectPath, 'newProject', 'pom.xml'), 
                '<artifactId>newProject</artifactId>');
            });

            await test.step("Create New Project with Advanced Config Tests", async () => {
                await page.executePaletteCommand("MI: Open MI Welcome");
                await createProject(page, 'newProjectWithAdConfig', '4.4.0', true);
                assertFileContent(path.join(newProjectPath, 'newProjectWithAdConfig', 'pom.xml'), 
                '<artifactId>test</artifactId>');
            });

            await test.step("Create New Project from Sample", async () => {
                await page.executePaletteCommand("MI: Open MI Welcome");
                await page.selectSidebarItem('Micro Integrator');
                const welcomePage = new Welcome(page);
                await welcomePage.init();
                await welcomePage.createNewProjectFromSample('Hello World ServiceA simple', newProjectPath);
                const projectExplorer = new ProjectExplorer(page.page);
                await projectExplorer.goToOverview("HelloWorldService");
                const overview = new Overview(page.page);
                await overview.init();
                await overview.diagramRenderingForApi('HelloWorld');
            });

            await test.step("Open Existing Project Tests", async () => {
                await page.executePaletteCommand("MI: Open Project");
                await page.page.getByLabel('input').fill('');
                await page.page.getByLabel('input').fill(newProjectPath + '/newProject/');
                await page.page.getByRole('button', { name: 'Open MI Project' }).click();
                const addArtifactSelector = '.tab-label:has-text("Add Artifact")';
                await page.page.waitForSelector(addArtifactSelector, { state: 'visible' });
                await page.page.waitForSelector(addArtifactSelector, { state: 'attached' });
                const api = new Api(page.page);
                await api.init();
                await api.add('helloWorld');
                const projectExplorer = new ProjectExplorer(page.page);
                await projectExplorer.goToOverview("newProject");
                const overview = new Overview(page.page);
                await overview.init();
                await overview.diagramRenderingForApi('helloWorld');
            });
        });
    });
}
