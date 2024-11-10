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

const fs = require('fs');

test.describe.configure({ mode: 'serial' });

const NEED_INITIAL_SETUP = true;
const NEED_CLEANUP = true;

if (NEED_INITIAL_SETUP) initProject();
else resumeProject();

tryBasicMappings();
tryArrayMappings();
finishUp();


// Test functions
function initProject() {
  // create project until resource view

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
}

function resumeProject() {
  test.beforeAll(async () => {
    console.log('Resuming datamapper tests')
    await resumeVSCode();
  });
}

function tryBasicMappings() {
  test('Try Basic Mappings', async () => {

    let dm: DataMapper;

    if (NEED_INITIAL_SETUP) {
      dm = await addDataMapper('basic');
      await closeNotification(page);
      await dm.loadJsonFromCompFolder();
      expect(dm.verifyTsFileContent('init.ts')).toBeTruthy();
      
    } else {
      dm = await openDataMapperFromTreeView('basic');
    }

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


    expect(dm.verifyTsFileContent('map.ts')).toBeTruthy();

    if (NEED_INITIAL_SETUP) {
      await dmWebView.locator('vscode-button[title="Go Back"]').click();
    }

  });
}

function tryArrayMappings() {
  test('Try Array Mappings', async () => {

    let dm: DataMapper;

    if (NEED_INITIAL_SETUP) {
      dm = await addDataMapper('array');
      await closeNotification(page);
      await dm.loadJsonFromCompFolder();
      expect(dm.verifyTsFileContent('init.ts')).toBeTruthy();
    } else {
      dm = await openDataMapperFromTreeView('array');
    }

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

    expect(dm.verifyTsFileContent('map.ts')).toBeTruthy();

    if (NEED_INITIAL_SETUP) {
      await dmWebView.locator('vscode-button[title="Go Back"]').click();
    }

  });
}

function finishUp() {
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
    if (NEED_CLEANUP) {
      if (fs.existsSync(newProjectPath)) {
        fs.rmSync(newProjectPath, { recursive: true });
      }
    }

    console.log('DataMapper tests completed')
  });
}

// Helper functions
async function addDataMapper(name: string) {
  // add data mapper to the service designer, return the data mapper object , should be used inside a test
  const diagram = new Diagram(page.page, 'Resource');
  await diagram.init();
  await diagram.addMediator('DataMapper', 0, {
    values: {
      'Name*': {
        type: 'input',
        value: name,
      }
    }
  }, "Create Mapping");

  const dm = new DataMapper(page.page, name);
  await dm.init();
  expect(dm.verifyFileCreation()).toBeTruthy();
  return dm;
}

async function openDataMapperFromResourceView(name: string) {
  // open data mapper from resource view
  const diagram = new Diagram(page.page, 'Resource');
  await diagram.init();
  console.log('.:.Getting mediator');
  const mediator = await diagram.getMediator('DataMapper');
  await mediator.clickLink(name);

  const dm = new DataMapper(page.page, name);
  await dm.init();
  return dm;
}

async function openDataMapperFromTreeView(name: string) {
  // open data mapper from tree view
  const dmLabel = await page.page.waitForSelector('div[aria-label="Data Mappers"]', { timeout: 180000 });
  await dmLabel.click();
  await page.page.waitForTimeout(1000);
  const dmItem = await page.page.waitForSelector(`div[aria-label="${name}"]`, { timeout: 180000 });
  await dmItem.click();

  const dm = new DataMapper(page.page, name);
  await dm.init();
  return dm;
}

