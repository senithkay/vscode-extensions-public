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
import { API } from "./../components/ArtifactTest/APITests";
import { ProjectExplorer } from "./../components/ProjectExplorer";
import { Overview } from "./../components/Overview";
import { createProject, page, waitUntilPomContains, initTest} from '../Utils';
import path from "path";
import fs from 'fs';
const dataFolder = path.join( __dirname, '..', 'data');

export const newProjectPath = path.join(dataFolder, 'new-project', 'testProject');

export default function createTests() {
    test.describe("Create Project Tests", {
        tag: '@group2'
    }, async () => {
        initTest(true, true, false);

        test("Create Project Tests", async () => {
            await test.step('Create New Project Tests', async () => {
                await createProject(page, 'newProject', '4.4.0');
                await waitUntilPomContains(page.page, path.join(newProjectPath, 'newProject', 'pom.xml'), 
                '<artifactId>newproject</artifactId>');
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
                const fileInput = await page.page?.waitForSelector('.quick-input-header');
                const textInput = await fileInput?.waitForSelector('input[type="text"]');
                await textInput?.fill(newProjectPath + '/newProject/');
                const openBtn = await fileInput?.waitForSelector('a.monaco-button:has-text("Open MI Project")');
                await openBtn?.click();
                const addArtifactSelector = '.tab-label:has-text("Add Artifact")';
                await page.page.waitForSelector(addArtifactSelector, { state: 'visible' });
                await page.page.waitForSelector(addArtifactSelector, { state: 'attached' });
                const api = new API(page.page);
                await api.init('newProject');
                await api.addAPI('helloWorld', '/helloWorld');
                const overview = new Overview(page.page);
                await overview.init("newProject");
                await overview.diagramRenderingForApi('helloWorld');
            });

            await test.step("Create New Project with Advanced Config Tests", async () => {
                fs.rmSync(newProjectPath, { recursive: true });
                await page.page.reload();
                await page.executePaletteCommand("MI: Open MI Welcome");
                await createProject(page, 'newProjectWithAdConfig', '4.4.0', true);
                await waitUntilPomContains(page.page, path.join(newProjectPath, 'newProject', 'newProjectWithAdConfig', 'pom.xml'), 
                '<artifactId>test</artifactId>');
            });
        });
    });
}
