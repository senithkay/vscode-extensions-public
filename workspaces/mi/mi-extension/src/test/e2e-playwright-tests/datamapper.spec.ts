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
import { closeNotification, createProject, dataFolder, initVSCode, newProjectPath, page, resourcesFolder, resumeVSCode, vscode } from './Utils';
import { DataMapper } from './components/DataMapper';
import { Overview } from './components/Overview';
import { IOType } from '@wso2-enterprise/mi-core';

const fs = require('fs');

const DM_NAME = 'dm1';

const dmFilesPath = path.join(dataFolder, 'datamapper-files');

test.describe.configure({ mode: 'serial' });

const NEED_INITIAL_SETUP = false;

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
    await page.page.pause();
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
      console.log('Resuming datamapper tests')
      await resumeVSCode();
    });

    test('Open DataMapper from tree view', async () => {
      // console.log('.:.Do Mappings1');
      // await page.page.waitForTimeout(180000);

      // await page.page.waitForTimeout(5000);

      const dataMappersLabel = await page.page.waitForSelector('div[aria-label="Data Mappers"]', { timeout: 180000 });
      await dataMappersLabel.click();
      await page.page.waitForTimeout(1000);
      const dataMapperItem = await page.page.waitForSelector(`div[aria-label="${DM_NAME}"]`, { timeout: 180000 });
      await dataMapperItem.click();
   

      // await page.page.locator('div[aria-label="Data Mappers"]').nth(1).click();
      // await page.page.waitForTimeout(1000);
      // await page.page.locator(`div[aria-label="${DM_NAME}"]`).nth(1).click();


      console.log('.:.Open DataMapper from tree view');

      const dataMapper = new DataMapper(page.page, DM_NAME);
      await dataMapper.init();
      console.log('.:.DataMapper opened');
   

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


    const dm = new DataMapper(page.page, DM_NAME);
    await dm.init();
    const dmWebView = dm.getWebView();

    // direct mapping
    // objectOutput.dmO = input.dmI;
    await dm.mapFields('input.dmI', 'objectOutput.dmO');
    await dmWebView.getByTestId('link-from-input.dmI.OUT-to-objectOutput.dmO.IN').waitFor({ state: 'attached' });

    // direct mapping with error
    // objectOutput.dmeO = input.dmeI;
    await dm.mapFields('input.dmeI', 'objectOutput.dmeO');
    await dm.expectErrorLink(dmWebView.getByTestId('link-from-input.dmeI.OUT-to-objectOutput.dmeO.IN'));

    await closeNotification(page);

    // many-one mapping
    // objectOutput.moO = input.mo1I + input.mo2I + input.mo3I;
    await dm.mapFields('input.mo1I', 'objectOutput.moO');
    await dm.mapFields('input.mo2I', 'objectOutput.moO');
    await dm.mapFields('input.mo3I', 'objectOutput.moO');

    await dmWebView.getByTestId('link-from-input.mo1I.OUT-to-datamapper-intermediate-port').waitFor({ state: 'attached' });
    await dmWebView.getByTestId('link-from-input.mo2I.OUT-to-datamapper-intermediate-port').first().waitFor({ state: 'attached' });
    await dmWebView.getByTestId('link-from-input.mo3I.OUT-to-datamapper-intermediate-port').first().waitFor({ state: 'attached' });
    await dmWebView.getByTestId('link-from-datamapper-intermediate-port-to-objectOutput.moO.IN').waitFor({ state: 'attached' });
    await dmWebView.getByTestId('link-connector-node-objectOutput.moO.IN').waitFor();
    
    // many-one mapping with error
    // objectOutput.moeO = input.mo2I + input.moeI + input.mo3I
    await dm.mapFields('input.mo2I', 'objectOutput.moeO');
    await dm.mapFields('input.moeI', 'objectOutput.moeO');
    await dm.mapFields('input.mo3I', 'objectOutput.moeO');

    await dm.expectErrorLink(dmWebView.getByTestId('link-from-input.mo2I.OUT-to-datamapper-intermediate-port').nth(1));
    await dm.expectErrorLink(dmWebView.getByTestId('link-from-input.mo3I.OUT-to-datamapper-intermediate-port').nth(1));
    await dm.expectErrorLink(dmWebView.getByTestId('link-from-input.moeI.OUT-to-datamapper-intermediate-port'));
    await dm.expectErrorLink(dmWebView.getByTestId('link-from-datamapper-intermediate-port-to-objectOutput.moeO.IN'));
    await dmWebView.getByTestId('link-connector-node-objectOutput.moeO.IN').waitFor();
    
   
    // object direct mapping
    // objectOutput.odmO= input.odmI;
    await dm.mapFields('input.odmI', 'objectOutput.odmO');
    await dmWebView.getByTestId('link-from-input.odmI.OUT-to-objectOutput.odmO.IN').waitFor({ state: 'attached' });

    // object direct mapping with error
    // objectOutput.odmeO = input.odmI
    await dm.mapFields('input.odmI', 'objectOutput.odmeO');
    await dm.expectErrorLink(dmWebView.getByTestId('link-from-input.odmI.OUT-to-objectOutput.odmeO.IN'));
    

    // object properties mapping
    // objectOutput.ompO.p1 = input.odmI.dm1;
    await dm.mapFields('input.odmI.dm1', 'objectOutput.ompO.p1');
    await dmWebView.getByTestId('link-from-input.odmI.dm1.OUT-to-objectOutput.ompO.p1.IN').waitFor({ state: 'attached' });

    // objectOutput.ompO.p2 = input.opmI.dm2;
    await dm.mapFields('input.opmI.op2', 'objectOutput.ompO.p2');
    await dmWebView.getByTestId('link-from-input.opmI.op2.OUT-to-objectOutput.ompO.p2.IN').waitFor({ state: 'attached' });

    // const mappingsTsFile = path.join(dmFilesPath, DM_NAME, 'mappings.ts');
    // expect(dataMapper.verifyTsFileContent(mappingsTsFile)).toBeTruthy();
    







  });

  test('Do Array Mappings', async () => {
    return;
    const dm = new DataMapper(page.page, DM_NAME);
    await dm.init();
    const dmWebView = dm.getWebView();

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
    await closeNotification(page);

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

    // Initialize 1d array and map
    await dmWebView.locator('[id="recordfield-objectOutput\\.i1O"] #component-list-menu-btn i').click();
    await dmWebView.getByRole('gridcell', { name: 'Initialize Array' }).click();
    await dm.waitForProgressEnd();
    await dmWebView.getByTestId('array-widget-objectOutput.i1O.IN-add-element').click();
    await dmWebView.locator('[id="recordfield-input\\.i1I"] i').click();
    await dmWebView.getByTestId('array-widget-objectOutput.i1O.IN-values').locator('i').first().click();
    await dm.waitForProgressEnd();
    await dmWebView.getByTestId('link-from-input.i1I.OUT-to-objectOutput.i1O.0.IN').waitFor({ state: 'attached' });


    // Initialize 2d array and map
    await dmWebView.locator('[id="recordfield-objectOutput\\.i2O"] #component-list-menu-btn i').click();
    await dmWebView.getByText('Initialize Array').click();
    await dm.waitForProgressEnd();
    await dmWebView.getByTestId('array-widget-objectOutput.i2O.IN-add-element').click();
    await dmWebView.getByTestId('array-widget-objectOutput.i2O.0.IN-add-element').click();
    await dmWebView.locator('[id="recordfield-input\\.i1I"]').click();
    await dmWebView.getByTestId('array-widget-objectOutput.i2O.0.IN-values').locator('i').first().click();
    await dm.waitForProgressEnd();
    await dmWebView.getByTestId('link-from-input.i1I.OUT-to-objectOutput.i2O.0.0.IN').waitFor({ state: 'attached' });


    // Init array object and map scroll 

    await dmWebView.locator('[id="recordfield-objectOutput\\.iobjO"] #component-list-menu-btn i').click();
    await dmWebView.getByText('Initialize Array').click();
    await dm.waitForProgressEnd();
    await dmWebView.getByTestId('array-widget-objectOutput.iobjO.IN-add-element').click();
    await dmWebView.locator('[id="recordfield-input\\.i1I"]').click();
    await dm.scrollClickOutput(dmWebView.locator('[id="recordfield-objectOutput\\.iobjO\\.0\\.p1"]'));
    await dm.waitForProgressEnd();
    await dmWebView.getByTestId('link-from-input.i1I.OUT-to-objectOutput.iobjO.0.p1.IN').waitFor({ state: 'attached' });

    await dmWebView.locator('[id="recordfield-objectOutput\\.iobjO\\.0\\.p2"] #component-list-menu-btn i').click();
    await dmWebView.getByText('Initialize Array').click();
    await dmWebView.getByTestId('array-widget-objectOutput.iobjO.0.p2.IN-add-element').click();
    await dmWebView.locator('[id="recordfield-input\\.i1I"]').click();
    await dmWebView.getByTestId('array-widget-objectOutput.iobjO.0.p2.IN-values').locator('i').first().click();
    await dm.waitForProgressEnd();
    await dmWebView.getByTestId('link-from-input.i1I.OUT-to-objectOutput.iobjO.0.p2.0.IN').waitFor({ state: 'attached' });

    await dm.scrollClickOutput(dmWebView.getByTestId('array-widget-objectOutput.iobjO.IN-add-element'));
    await dmWebView.locator('[id="recordfield-input\\.iobjI"]').click();
    await dmWebView.locator('[id="recordfield-objectOutput\\.iobjO\\.1"]').click();
    await dm.waitForProgressEnd();
    await dmWebView.getByTestId('link-from-input.iobjI.OUT-to-objectOutput.iobjO.1.IN').waitFor({ state: 'attached' });


    // 2D array direct mapping
    await dmWebView.locator('[id="recordfield-input\\.d2I"] i').click();
    await dm.scrollClickOutput(dmWebView.getByTestId('array-type-editable-record-field-objectOutput.d2O.IN').locator('i'));
    await dmWebView.locator('#menu-item-a2a-direct').click();
    await dm.waitForProgressEnd();
    await dmWebView.getByTestId('link-from-input.d2I.OUT-to-objectOutput.d2O.IN').waitFor({ state: 'attached' });

    // 1D - 0D array direct mapping (singleton access)
    await dmWebView.locator('[id="recordfield-input\\.s10O"] i').click();
    await dm.scrollClickOutput(dmWebView.locator('[id="recordfield-objectOutput\\.s10O"] i').first());
    await dm.waitForProgressEnd();
    await dmWebView.getByTestId('link-from-input.s10O.OUT-to-datamapper-intermediate-port').waitFor({ state: 'attached' });
    await dmWebView.getByTestId('link-from-datamapper-intermediate-port-to-objectOutput.s10O.IN').waitFor({ state: 'attached' });
    await dmWebView.getByTestId('link-connector-node-objectOutput.s10O.IN').waitFor();

    // 2D - 1D array direct mapping (singleton access) 30-38
    await dmWebView.locator('[id="recordfield-input\\.s21I"] i').click();
    await dm.scrollClickOutput(dmWebView.getByTestId('array-type-editable-record-field-objectOutput.s21O.IN').locator('i'));
    await dm.waitForProgressEnd();
    await dmWebView.getByTestId('link-from-input.s21I.OUT-to-datamapper-intermediate-port').waitFor({ state: 'attached' });
    await dmWebView.getByTestId('link-from-datamapper-intermediate-port-to-objectOutput.s21O.IN').waitFor({ state: 'attached' });
    await dmWebView.getByTestId('link-connector-node-objectOutput.s21O.IN').waitFor({ state: 'attached' });

    // 2D array mapping with mapping function 11-24
    await dmWebView.locator('[id="recordfield-input\\.m2I"] i').click();
    await dmWebView.getByTestId('array-type-editable-record-field-objectOutput.m2O.IN').locator('i').click();
    await dmWebView.locator('#menu-item-a2a-inner').click();
    await dm.waitForProgressEnd();
    await dmWebView.getByTestId('link-from-input.m2I.OUT-to-datamapper-intermediate-port').waitFor({ state: 'attached' });
    await dmWebView.getByTestId('link-from-datamapper-intermediate-port-to-objectOutput.m2O.IN').waitFor({ state: 'attached' });

    await dmWebView.getByTestId('expand-array-fn-m2O').locator('i').click();
    await dmWebView.getByTestId('focusedInput.m2IItem-node').locator('i').click();
    await dmWebView.getByTestId('arrayOutput-node').locator('i').first().click();
    await dmWebView.locator('#menu-item-a2a-inner').click();
    await dm.waitForProgressEnd();
    await dmWebView.getByTestId('link-from-focusedInput.m2IItem.OUT-to-datamapper-intermediate-port').waitFor({ state: 'attached' });
    await dmWebView.getByTestId('link-from-datamapper-intermediate-port-to-arrayOutput.IN').waitFor({ state: 'attached' });

    await dmWebView.getByTitle('Map array elements').locator('i').click();
    await dmWebView.getByTestId('focusedInput.m2IItemItem-node').locator('i').click();
    await dmWebView.getByTestId('primitiveOutput-node').locator('i').nth(1).click();
    await dm.waitForProgressEnd();
    await dmWebView.getByTestId('link-from-focusedInput.m2IItemItem.OUT-to-primitiveOutput.number.IN').waitFor({ state: 'attached' });

    await dmWebView.getByTestId('dm-header-breadcrumb-0').click();
    await dmWebView.getByTestId('dm-header-breadcrumb-0').waitFor({ state: 'detached' });

    await page.page.pause();

    await page.page.waitForTimeout(10000);

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
