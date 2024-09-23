/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { test, ElectronApplication, expect } from '@playwright/test';
import { ExtendedPage, startVSCode } from "@wso2-enterprise/playwright-vscode-tester";
import * as path from 'path';
import { Welcome } from './components/Welcome';
import { Form } from './components/Form';
import { AddArtifact } from './components/AddArtifact';
import { ServiceDesigner } from './components/ServiceDesigner';
import { Diagram } from './components/Diagram';
const fs = require('fs');

const resourcesFolder = path.join(__dirname, '..', 'test-resources');
const dataFolder = path.join(__dirname, 'data');
const extensionsFolder = path.join(__dirname, '..', '..', '..', 'vsix');
const vscodeVersion = '1.92.0';

let vscode: ElectronApplication | undefined;
let page: ExtendedPage;

test.describe.configure({ mode: 'serial' });

test.beforeAll(async () => {
  const newProjectPath = path.join(dataFolder, 'new-project', 'testProject');
  // delete and recreate folder
  if (fs.existsSync(newProjectPath)) {
    fs.rmSync(newProjectPath, { recursive: true });
  }
  fs.mkdirSync(newProjectPath, { recursive: true });
  vscode = await startVSCode(resourcesFolder, vscodeVersion, undefined, false, extensionsFolder, newProjectPath);
  page = new ExtendedPage(await vscode!.firstWindow());
});

test('Create new project', async () => {
  // wait until extension is ready
  // Note: This is not required for CI/CD pipeline
  await page.waitUntilExtensionReady();

  await page.selectSidebarItem('Micro Integrator');
  const welcomePage = new Welcome(page.page);
  await welcomePage.init();
  await welcomePage.createNewProject();

  const createNewProjectForm = new Form(page.page, 'Project Creation Form');
  await createNewProjectForm.switchToFormView();
  await createNewProjectForm.fill({
    values: {
      'Project Name*': {
        type: 'input',
        value: 'testProject'
      },
    }
  });
  await createNewProjectForm.submit();
});

test('Create new API', async () => {

  // wait until window reload
  await page.page.waitForSelector('iframe.webview.ready', { state: 'detached' })
  page = new ExtendedPage(await vscode!.firstWindow());
  await page.waitUntilExtensionReady();

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

test('Service designer', async () => {
  // service designer
  const serviceDesigner = new ServiceDesigner(page.page);
  await serviceDesigner.init();
  const resource = await serviceDesigner.resource('GET', '/');
  await resource.click();
});

test('Add mediator in to resource', async () => {
  // diagram
  const diagram = new Diagram(page.page, 'Resource');
  await diagram.init();
  await diagram.addMediator('Log');
});

test('Edit mediator in resource', async () => {
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

test.afterAll(async () => {
  await vscode?.close();

  const videoTitle = new Date().toLocaleString().replace(/,|:|\/| /g, '_');
  const video = page.page.video()
  const videoDir = path.resolve(resourcesFolder, 'videos')
  const videoPath = await video?.path()

  if (video && videoPath) {
    await fs.renameSync(videoPath, `${videoDir}/${videoTitle}.webm`)
  }
});
