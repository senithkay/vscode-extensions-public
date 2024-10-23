/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

// interface Root {
//   dmI: string
//   dmeI: string
//   mo1I: string
//   mo2I: string
//   mo3I: string
//   moeI: number
//   odmI: {
//       dm1: string
//       dm2: number
//   }
//   opmI: {
//       op1: string
//       op2: string
//   }


// }

// /*
// * title : "root",1
// * outputType : "JSON",
// */
// interface OutputRoot {
//   dmO: string
//   dmeO: number
//   moO: string
//   moeO: string
//   odmO: {
//       dm1: string
//       dm2: number
//   }
//   odmeO: {
//       dm1: string
//       dm2: string
//   }
//   ompO: {
//       p1: string
//       p2: number
//   }

// }

import { test, expect } from '@playwright/test';
import * as path from 'path';
import { Form } from './components/Form';
import { AddArtifact } from './components/AddArtifact';
import { ServiceDesigner } from './components/ServiceDesigner';
import { Diagram } from './components/Diagram';
import { closeNotification, createProject, dataFolder, initVSCode, newProjectPath, page, resourcesFolder, resumeVSCode, vscode } from './Utils';
import { DataMapper } from './components/DataMapper';
import { Overview } from './components/Overview';
import { IOType } from '@wso2-enterprise/mi-core';
import { on } from 'events'
import { data } from 'jquery'
const fs = require('fs');

const DM_NAME = 'dm2';

const dmFilesPath = path.join(dataFolder, 'datamapper-files');



test.describe.configure({ mode: 'serial' });

// process.env.CI = 'true';
const NEED_INITIAL_SETUP = true;

if (process.env.CI || NEED_INITIAL_SETUP) 
  createAndAddDM();
doMappings();

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
          value: DM_NAME,
        }
      }
    }, "Create Mapping");

    const dataMapper = new DataMapper(page.page, DM_NAME);
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
  //   await mediator.clickLink(DM_NAME);

  //   console.log('.:.opening data mapper');

  // });



  // test.afterAll(async () => {
  //   // await vscode?.close();

  //   const videoTitle = `diagram_test_suite_${new Date().toLocaleString().replace(/,|:|\/| /g, '_')}`;
  //   const video = page.page.video()
  //   const videoDir = path.resolve(resourcesFolder, 'videos')
  //   const videoPath = await video?.path()

  //   if (video && videoPath) {
  //     video?.saveAs(path.resolve(videoDir, `${videoTitle}.webm`));
  //   }

  //   // cleanup
  //   // if (fs.existsSync(newProjectPath)) {
  //   //   fs.rmSync(newProjectPath, { recursive: true });
  //   // }
  //   console.log('Diagram tests completed')
  // });

}

function doMappings() {

  if (!(process.env.CI || NEED_INITIAL_SETUP)) {
    test.beforeAll(async () => {
      console.log('Starting datamapper tests')
      await resumeVSCode();
    });

    test('Open DataMapper from tree view', async () => {
      // console.log('.:.Do Mappings1');
      // await page.page.waitForTimeout(180000);

      // await page.page.waitForTimeout(5000);

      const dataMappersLabel = await page.page.waitForSelector('div[aria-label="Data Mappers"]', { timeout: 180000 });
      await dataMappersLabel.click();
      const dataMapperItem = await page.page.waitForSelector(`div[aria-label="${DM_NAME}"]`, { timeout: 180000 });
      await dataMapperItem.click();

      const dataMapper = new DataMapper(page.page, DM_NAME);
      await dataMapper.init();

    });
  }

  if (process.env.CI || NEED_INITIAL_SETUP) {
    test('Load Schemas', async () => {
      const dataMapper = new DataMapper(page.page, DM_NAME);
      await dataMapper.init();

      const interfacesTsFile = path.join(dmFilesPath, DM_NAME, 'interfaces.ts');
      const inputJsonFile = path.join(dmFilesPath, DM_NAME, 'input.json');
      const outputJsonFile = path.join(dmFilesPath, DM_NAME, 'output.json');
      await dataMapper.importSchema(IOType.Input, 'JSON', inputJsonFile);
      await dataMapper.importSchema(IOType.Output, 'JSON', outputJsonFile);

      expect(dataMapper.verifyTsFileContent(interfacesTsFile)).toBeTruthy();
    });
  }


  test('Do Basic Mappings', async () => {

    return;
    const dataMapper = new DataMapper(page.page, DM_NAME);
    await dataMapper.init();

    // await closeNotification(page);

    // await page.page.waitForTimeout(5000);
    // return;

    // const interfacesTsFile = path.join(dmFilesPath, DM_NAME, 'interfaces.ts');
    // dataMapper.overwriteTsFile(interfacesTsFile);
    // await page.page.waitForTimeout(10000);

    // const input: Root = {};
    // const objectOutput: OutputRoot = {};

    // direct mapping
    // objectOutput.dmO = input.dmI;
    await dataMapper.mapFields('input.dmI', 'objectOutput.dmO');


    // direct mapping with error
    // objectOutput.dmeO = input.dmeI;
    await dataMapper.mapFields('input.dmeI', 'objectOutput.dmeO');


    // many-one mapping
    // objectOutput.moO = input.mo1I + input.mo2I + input.mo3I;
    await dataMapper.mapFields('input.mo1I', 'objectOutput.moO');
    await dataMapper.mapFields('input.mo2I', 'objectOutput.moO');
    await dataMapper.mapFields('input.mo3I', 'objectOutput.moO');


    await closeNotification(page);

    // many-one mapping with error
    // objectOutput.moeO = input.mo2I + input.moeI + input.mo3I
    await dataMapper.mapFields('input.mo2I', 'objectOutput.moeO');
    await dataMapper.mapFields('input.moeI', 'objectOutput.moeO');
    await dataMapper.mapFields('input.mo3I', 'objectOutput.moeO');



    // object direct mapping
    // objectOutput.odmO= input.odmI;
    await dataMapper.mapFields('input.odmI', 'objectOutput.odmO');


    // object direct mapping with error
    // objectOutput.odmeO = input.odmI
    await dataMapper.mapFields('input.odmI', 'objectOutput.odmeO');

    // object properties mapping
    // objectOutput.ompO.p1 = input.odmI.dm1;
    await dataMapper.mapFields('input.odmI.dm1', 'objectOutput.ompO.p1');

    // objectOutput.ompO.p2 = input.opmI.dm2;
    await dataMapper.mapFields('input.opmI.op2', 'objectOutput.ompO.p2');





    //await dataMapper.mapFields('input.city', 'objectOutput.home');
    // await dataMapper.mapFields('input.name', 'objectOutput.age');
    // await dataMapper.mapFields('input.age', 'objectOutput.name');

    // const mappingsEaFile = path.join(dmFilesPath, DM_NAME, 'mappings.ea');
    // await dataMapper.runEventActions(mappingsEaFile);

    // await page.page.waitForTimeout(1000);

    // const mappingsTsFile = path.join(dmFilesPath, DM_NAME, 'mappings.ts');
    // expect(dataMapper.verifyTsFileContent(mappingsTsFile)).toBeTruthy();


  });

  // test('Do Array Mappings', async () => {
  //   const dataMapper = new DataMapper(page.page, DM_NAME);
  //   await dataMapper.init();

  //   // array mapping
  //   // objectOutput.nd1dO = input.nd1dI;
  //   // await dataMapper.mapArrayDirect('input.d1I', 'objectOutput.d1O');

  //   // // primitive array mapping with mapping function
  //   // await dataMapper.mapArrayInner('input.m1I', 'objectOutput.m1O');
  //   // await dataMapper.mapFields('focusedInput.m1IItem', 'primitiveOutput.number');
  //   // await dataMapper.gotoPreviousView();

  //   // // object array mapping with mapping function
  //   // await dataMapper.mapArrayInner('input.m1objI', 'objectOutput.m1objO');
  //   // await dataMapper.mapFields('focusedInput.m1objIItem.p1', 'objectOutput.q1');

  //   // await dataMapper.mapArrayInner('focusedInput.m1objIItem.p2', 'objectOutput.q2');
  //   // await dataMapper.mapFields('focusedInput.p2Item', 'primitiveOutput.string');
  //   // await dataMapper.gotoPreviousView();
  //   // await dataMapper.gotoPreviousView();

  //   // const savedSnapshotFile = path.join(dataFolder, 'datamapper-files', 'array', 'snapshot.html');
  //   // const currentSnapshotFile = path.join(dataFolder, 'datamapper-files', 'array', 'current.html');
  //   // await dataMapper.saveSnapshot(currentSnapshotFile);

  //   // expect(dataMapper.compareFiles(savedSnapshotFile, currentSnapshotFile)).toBeTruthy();

  //   await page.page.pause();

  //   await page.page.waitForTimeout(10000);



  //   // array mapping with mapping function and error #know issue

  //   // Initialize array and map

  //   // 2D array direct mapping


  //   // 2D array mapping with mapping function


  //   // 2D - 1D array direct mapping (singleton access)


  //   // 3D - 2D array direct mapping (singleton access)


  //   // 3D - 1D array direct mapping (singleton access)

  // });

  test('Do Array Mappings', async () => {
    const dm = new DataMapper(page.page, DM_NAME);
    await dm.init();
    const dmWebView = dm.getWebView();

    await dm.scrollOutputUntilVisible(dmWebView.getByTestId('array-type-editable-record-field-objectOutput.d1O.IN').locator('i'));

    // await page.page.pause();

   

    // primitive direct array mapping
    await dmWebView.locator('[id="recordfield-input\\.d1I"] i').click();
    await dmWebView.getByTestId('array-type-editable-record-field-objectOutput.d1O.IN').locator('i').click();
    await dmWebView.locator('#menu-item-a2a-direct').click();
    await dm.waitForProgressEnd();
    await dmWebView.getByTestId('link-from-input.d1I.OUT-to-objectOutput.d1O.IN').waitFor({ state: 'attached' });
    
    // primitive array mapping with mapping function
    await dmWebView.locator('[id="recordfield-input\\.m1I"] i').click();
    await dmWebView.getByTestId('array-type-editable-record-field-objectOutput.m1O.IN').locator('i').click();
    await dmWebView.locator('#menu-item-a2a-inner').click();
    await dm.waitForProgressEnd();
    await dmWebView.getByTestId('link-from-input.m1I.OUT-to-datamapper-intermediate-port').waitFor({ state: 'attached' });
    await dmWebView.getByTestId('link-from-datamapper-intermediate-port-to-objectOutput.m1O.IN').waitFor({ state: 'attached' });

    await dmWebView.getByTitle('Map array elements').locator('i').click();
    await dmWebView.getByTestId('focusedInput.m1IItem-node').locator('i').click();
    await dmWebView.getByTestId('primitiveOutput-node').locator('i').nth(1).click();
    await dm.waitForProgressEnd();
    await dmWebView.getByTestId('link-from-focusedInput.m1IItem.OUT-to-primitiveOutput.number.IN').waitFor({ state: 'attached' });

    await dmWebView.getByTestId('dm-header-breadcrumb-0').click();

    // object array mapping with mapping function
    await dmWebView.locator('[id="recordfield-input\\.m1objI"] i').click();
    await dmWebView.getByTestId('array-type-editable-record-field-objectOutput.m1objO.IN').locator('i').click();
    await dmWebView.locator('#menu-item-a2a-inner').click();
    await dm.waitForProgressEnd();
    await dmWebView.getByTestId('link-from-input.m1objI.OUT-to-datamapper-intermediate-port').waitFor({ state: 'attached' });
    await dmWebView.getByTestId('link-from-datamapper-intermediate-port-to-objectOutput.m1objO.IN').waitFor({ state: 'attached' });

    await dmWebView.getByTestId('array-connector-node-objectOutput.m1objO.IN').getByTitle('Map array elements').locator('i').click();
    await dmWebView.locator('[id="recordfield-focusedInput\\.m1objIItem\\.p1"] i').click();
    await dmWebView.locator('[id="recordfield-objectOutput\\.q1"] i').first().click();
    await dm.waitForProgressEnd();
    await dmWebView.getByTestId('link-from-focusedInput.m1objIItem.p1.OUT-to-objectOutput.q1.IN').waitFor({ state: 'attached' });
    
    await dmWebView.locator('[id="recordfield-focusedInput\\.m1objIItem\\.p2"] i').click();
    await dmWebView.getByTestId('array-type-editable-record-field-objectOutput.q2.IN').locator('i').click();
    await dmWebView.locator('#menu-item-a2a-inner').click();
    await dm.waitForProgressEnd();
    await dmWebView.getByTestId('link-from-focusedInput.m1objIItem.p2.OUT-to-datamapper-intermediate-port').waitFor({ state: 'attached' });
    await dmWebView.getByTestId('link-from-datamapper-intermediate-port-to-objectOutput.q2.IN').waitFor({ state: 'attached' });
    
    await dmWebView.getByTitle('Map array elements').locator('i').click();
    await dmWebView.getByTestId('focusedInput.p2Item-node').locator('i').click();
    await dmWebView.getByTestId('primitiveOutput-node').locator('i').nth(1).click();
    await dm.waitForProgressEnd();
    await dmWebView.getByTestId('link-from-focusedInput.p2Item.OUT-to-primitiveOutput.string.IN').waitFor({ state: 'attached' });
    
    await dm.gotoPreviousView();
    await dm.gotoPreviousView();

    // Initialize array and map

    // 2D array direct mapping


    // 2D array mapping with mapping function

    // 1D - 0D array direct mapping (singleton access)


    // 2D - 1D array direct mapping (singleton access)


    // 3D - 2D array direct mapping (singleton access)


    // 3D - 1D array direct mapping (singleton access)


    await page.page.pause();

    await page.page.waitForTimeout(10000);



    // array mapping with mapping function and error #know issue

    // Initialize array and map

    // 2D array direct mapping


    // 2D array mapping with mapping function


    // 2D - 1D array direct mapping (singleton access)


    // 3D - 2D array direct mapping (singleton access)


    // 3D - 1D array direct mapping (singleton access)

  });



  test.afterAll(async () => {
    await vscode?.close();

    const videoTitle = `diagram_test_suite_${new Date().toLocaleString().replace(/,|:|\/| /g, '_')}`;
    const video = page.page.video()
    const videoDir = path.resolve(resourcesFolder, 'videos')
    const videoPath = await video?.path()

    if (video && videoPath) {
      video?.saveAs(path.resolve(videoDir, `${videoTitle}.webm`));
    }

    // cleanup
    if (process.env.CI) {
      if (fs.existsSync(newProjectPath)) {
        fs.rmSync(newProjectPath, { recursive: true });
      }
    }

    console.log('DataMapper tests completed')
  });

}
