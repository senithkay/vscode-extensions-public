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
import { Form } from './components/Form';
import { AddArtifact } from './components/AddArtifact';
import { ServiceDesigner } from './components/ServiceDesigner';
import { Diagram } from './components/Diagram';
import { closeNotification, createProject, initVSCode, newProjectPath, page, resourcesFolder, resumeVSCode, vscode } from './Utils';
import { DataMapper } from './components/DataMapper';
import { Overview } from './components/Overview';
const fs = require('fs');
test.describe.configure({ mode: 'serial' });

createAndAddDM();

function createAndAddDM() {

  test.beforeAll(async () => {
    console.log('Starting datamapper tests')
    // delete and recreate folder
    if (fs.existsSync(newProjectPath)) {
      fs.rmSync(newProjectPath, { recursive: true });
    }
    fs.mkdirSync(newProjectPath, { recursive: true });
    await initVSCode();

  });

  test('Create new project', async () => {
    // wait until extension is ready
    // Note: This is not required for CI/CD pipeline
    // await page.waitUntilExtensionReady();

    await createProject(page);
  });

  test('Create new API', async () => {
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

  test('Service designer', async () => {
    // service designer
    const serviceDesigner = new ServiceDesigner(page.page);
    await serviceDesigner.init();
    const resource = await serviceDesigner.resource('GET', '/');
    await resource.click();
  });

  test('Add & Open DataMapper', async () => {

    const diagram = new Diagram(page.page, 'Resource');
    await diagram.init();
    await diagram.addMediator('DataMapper', 0, {
      values: {
        'Name*': {
          type: 'input',
          value: 'dm1',
        }
      }
    }, "Create Mapping");

    const dataMapper = new DataMapper(page.page, 'dm1');
    await dataMapper.init();
    expect(dataMapper.verifyFileCreation()).toBeTruthy();
  });

  // test('Open DataMapper in resource', async () => {
  //   console.log('.:.Open DataMapper in resource');

  //   console.log('.:.Getting resource view');
  //   const diagram = new Diagram(page.page, 'Resource');
  //   await diagram.init();
  //   console.log('.:.Getting mediator');
  //   const mediator = await diagram.getMediator('DataMapper');
  //   await mediator.clickLink('dm1');

  //   console.log('.:.opening data mapper');

  // });



  test.afterAll(async () => {
    // await vscode?.close();

    const videoTitle = `diagram_test_suite_${new Date().toLocaleString().replace(/,|:|\/| /g, '_')}`;
    const video = page.page.video()
    const videoDir = path.resolve(resourcesFolder, 'videos')
    const videoPath = await video?.path()

    if (video && videoPath) {
      video?.saveAs(path.resolve(videoDir, `${videoTitle}.webm`));
    }

    // cleanup
    // if (fs.existsSync(newProjectPath)) {
    //   fs.rmSync(newProjectPath, { recursive: true });
    // }
    console.log('Diagram tests completed')
  });

}

function doMappings() {

  test.beforeAll(async () => {
    console.log('Starting datamapper tests')
    await resumeVSCode();
  });

  test('Do Mappings', async () => {
    console.log('.:.Do Mappings1');
    await page.page.waitForTimeout(60000);
    const overviewPage = new Overview(page.page);
    await overviewPage.init();
    console.log('.:.Do Mappings2');
    await page.page.waitForTimeout(60000);
    const dataMapper = new DataMapper(page.page, 'dm1');
    await dataMapper.init();
  });


  test.afterAll(async () => {
    // await vscode?.close();

    const videoTitle = `diagram_test_suite_${new Date().toLocaleString().replace(/,|:|\/| /g, '_')}`;
    const video = page.page.video()
    const videoDir = path.resolve(resourcesFolder, 'videos')
    const videoPath = await video?.path()

    if (video && videoPath) {
      video?.saveAs(path.resolve(videoDir, `${videoTitle}.webm`));
    }

    // cleanup
    // if (fs.existsSync(newProjectPath)) {
    //   fs.rmSync(newProjectPath, { recursive: true });
    // }
    console.log('Diagram tests completed')
  });

}
