/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
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
import { clearNotificationsByCloseButton, initTest, newProjectPath, dataFolder, page, resourcesFolder, vscode } from './Utils';
import { DataMapper, IOType, SchemaType } from './components/DataMapper';
import { ProjectExplorer } from './components/ProjectExplorer';
import { MACHINE_VIEW } from '@wso2-enterprise/mi-core';
import { Overview } from './components/Overview';

const fs = require('fs');

export default function createTests() {

  test.describe('Data Mapper Tests', () => {
    const NEED_INITIAL_SETUP = true;

    initTest(true);

    if (NEED_INITIAL_SETUP) setupProject();
    testBasicMappings();
    testArrayMappings();
    testImportOptions();
    
   
    function setupProject() {
      test('Setup project for Data Mapper', async () => {

        await test.step('Create new API', async () => {

          console.log('Creating new API for datamapper');

          const { title: iframeTitle } = await page.getCurrentWebview();
          if (iframeTitle === MACHINE_VIEW.Overview) {
            const overviewPage = new Overview(page.page);
            await overviewPage.init();
            await overviewPage.goToAddArtifact();
          }
  
          const overviewPage = new AddArtifact(page.page);
          await overviewPage.init();
          await overviewPage.add('API');

          const testAttempt = test.info().retry + 1;
  
          const apiForm = new Form(page.page, 'API Form');
          await apiForm.switchToFormView();
          await apiForm.fill({
            values: {
              'Name*': {
                type: 'input',
                value: 'dmApi'+testAttempt,
              },
              'Context*': {
                type: 'input',
                value: '/dmApi'+testAttempt,
              },
            }
          });
          await apiForm.submit();
        });
  
        await test.step('Service designer', async () => {
          // service designer
          console.log('Opening Service designer for datamapper');
  
          const serviceDesigner = new ServiceDesigner(page.page);
          await serviceDesigner.init();
          const resource = await serviceDesigner.resource('GET', '/');
          await resource.click();
        });

      });
    }

    function testBasicMappings() {
      test('Test Basic Mappings', async () => {

        console.log('Testing Basic Mappings');

        let dm: DataMapper;
        const DM_NAME = 'dm' + test.info().retry + 1;

        await clearNotificationsByCloseButton(page);

        console.log('- Load schemas from JSON data');

        if (NEED_INITIAL_SETUP) {
          const diagram = new Diagram(page.page, 'Resource');
          await diagram.init();
          await diagram.addDataMapper(DM_NAME);
          dm = new DataMapper(page.page, DM_NAME);
          await dm.init();
          await dm.loadJsonFromCompFolder('basic');
          expect(dm.verifyTsFileContent('basic/init.ts')).toBeTruthy();
        } else {
          overwriteTsFile('basic/init.ts');
          const projectExplorer = new ProjectExplorer(page.page);
          await projectExplorer.findItem(['Project testProject', 'Other Artifacts', 'Data Mappers', DM_NAME], true);
          dm = new DataMapper(page.page, DM_NAME);
          await dm.init();
        }

        const dmWebView = dm.getWebView();

        console.log('- Test direct mappings');

        // direct mapping
        // objectOutput.oPrimDirect = input.iPrimDirect;
        await dm.mapFields('input.iPrimDirect', 'objectOutput.oPrimDirect');
        const loc0 = dmWebView.getByTestId('link-from-input.iPrimDirect.OUT-to-objectOutput.oPrimDirect.IN');
        await loc0.waitFor({ state: 'attached' });

        // direct mapping with error
        // objectOutput.oPrimDirectErr = input.iPrimDirectErr;
        await dm.mapFields('input.iPrimDirectErr', 'objectOutput.oPrimDirectErr');
        const loc1=dmWebView.getByTestId('link-from-input.iPrimDirectErr.OUT-to-objectOutput.oPrimDirectErr.IN')
        await dm.expectErrorLink(loc1);

        await clearNotificationsByCloseButton(page);

        // many-one mapping
        // objectOutput.oManyOne = input.iManyOne1 + input.iManyOne2 + input.iManyOne3;
        await dm.mapFields('input.iManyOne1', 'objectOutput.oManyOne');
        await dm.mapFields('input.iManyOne2', 'objectOutput.oManyOne');
        await dm.mapFields('input.iManyOne3', 'objectOutput.oManyOne');

        await dmWebView.getByTestId('link-from-input.iManyOne1.OUT-to-datamapper-intermediate-port').waitFor({ state: 'attached' });
        await dmWebView.getByTestId('link-from-input.iManyOne2.OUT-to-datamapper-intermediate-port').first().waitFor({ state: 'attached' });
        await dmWebView.getByTestId('link-from-input.iManyOne3.OUT-to-datamapper-intermediate-port').first().waitFor({ state: 'attached' });
        await dmWebView.getByTestId('link-from-datamapper-intermediate-port-to-objectOutput.oManyOne.IN').waitFor({ state: 'attached' });
        const loc2 = dmWebView.getByTestId('link-connector-node-objectOutput.oManyOne.IN')
        await loc2.waitFor();

        // many-one mapping with error
        // objectOutput.oManyOneErr = input.iManyOne2 + input.iManyOneErr + input.iManyOne3
        await dm.mapFields('input.iManyOne2', 'objectOutput.oManyOneErr');
        await dm.mapFields('input.iManyOneErr', 'objectOutput.oManyOneErr');
        await dm.mapFields('input.iManyOne3', 'objectOutput.oManyOneErr');

        await dm.expectErrorLink(dmWebView.getByTestId('link-from-input.iManyOne2.OUT-to-datamapper-intermediate-port').nth(1));
        await dm.expectErrorLink(dmWebView.getByTestId('link-from-input.iManyOne3.OUT-to-datamapper-intermediate-port').nth(1));
        await dm.expectErrorLink(dmWebView.getByTestId('link-from-input.iManyOneErr.OUT-to-datamapper-intermediate-port'));
        await dm.expectErrorLink(dmWebView.getByTestId('link-from-datamapper-intermediate-port-to-objectOutput.oManyOneErr.IN'));
        const loc3 = dmWebView.getByTestId('link-connector-node-objectOutput.oManyOneErr.IN');
        await loc3.waitFor();


        // object direct mapping
        // objectOutput.oObjDirect= input.iObjDirect;
        await dmWebView.locator('[id="recordfield-input\\.iObjDirect"] i').nth(1).click();
        await dmWebView.locator('[id="recordfield-objectOutput\\.oObjDirect"] i').first().click();
        const menuItemDirect = dmWebView.locator('#menu-item-o2o-direct');
        await menuItemDirect.click();
        await menuItemDirect.waitFor({ state: 'detached' });
        await dmWebView.getByTestId('link-from-input.iObjDirect.OUT-to-objectOutput.oObjDirect.IN').waitFor({ state: 'attached' });

        // object direct mapping with error
        // objectOutput.oObjDirectErr = input.iObjDirect
        await dmWebView.locator('[id="recordfield-input\\.iObjDirect"] i').nth(1).click();
        await dmWebView.locator('[id="recordfield-objectOutput\\.oObjDirectErr"] i').first().click();
        await menuItemDirect.click();
        await menuItemDirect.waitFor({ state: 'detached' });
        await dm.expectErrorLink(dmWebView.getByTestId('link-from-input.iObjDirect.OUT-to-objectOutput.oObjDirectErr.IN'));

        // object properties mapping
        // objectOutput.oObjProp.p1 = input.iObjDirect.d1;
        await dm.mapFields('input.iObjDirect.d1', 'objectOutput.oObjProp.p1');
        await dmWebView.getByTestId('link-from-input.iObjDirect.d1.OUT-to-objectOutput.oObjProp.p1.IN').waitFor({ state: 'attached' });

        // objectOutput.oObjProp.p2 = input.opmI.d2;
        await dm.mapFields('input.opmI.op2', 'objectOutput.oObjProp.p2');
        await dmWebView.getByTestId('link-from-input.opmI.op2.OUT-to-objectOutput.oObjProp.p2.IN').waitFor({ state: 'attached' });

        console.log('- Test expression bar');

        // expression bar - use function
        await dmWebView.locator('[id="recordfield-objectOutput\\.oExp"]').click();
        const expressionBar = dmWebView.locator('#expression-bar').getByRole('textbox', { name: 'Text field' });
        await expect(expressionBar).toBeFocused();
        await expressionBar.fill('toupper');
        await dmWebView.getByText('dmUtils toUppercaseConverts a').click();
        await expect(expressionBar).toHaveValue('dmUtils.toUppercase()');
        await expect(expressionBar).toBeFocused();

        await dmWebView.locator('[id="recordfield-input\\.iExp"]').click();
        await expressionBar.press('Enter');
        await dmWebView.getByTestId('link-from-input.iExp.OUT-to-datamapper-intermediate-port').waitFor({ state: 'attached' });
        await dmWebView.getByTestId('link-from-datamapper-intermediate-port-to-objectOutput.oExp.IN').waitFor({ state: 'attached' });
        const loc4 = dmWebView.getByTestId('link-connector-node-objectOutput.oExp.IN');
        await loc4.waitFor();

        // await expressionBar.press('Enter');
        await dmWebView.locator('#data-mapper-canvas-container').click();

        await expect(expressionBar).not.toBeFocused();

        // TODO: need to test edit button

        // expression editor - edit existing
        await dmWebView.locator('[id="recordfield-objectOutput\\.oObjProp\\.p1"]').click();
        await expect(expressionBar).toBeFocused();
        await expressionBar.fill('input.iObjDirect.d1 + "HI"');
        await dmWebView.locator('#data-mapper-canvas-container').click();
        await expect(expressionBar).not.toBeFocused();

        await dmWebView.getByTestId('link-from-input.iObjDirect.d1.OUT-to-datamapper-intermediate-port').waitFor({ state: 'attached' });
        await dmWebView.getByTestId('link-from-datamapper-intermediate-port-to-objectOutput.oObjProp.p1.IN').waitFor({ state: 'attached' });
        await dmWebView.getByTestId('link-connector-node-objectOutput.oObjProp.p1.IN').waitFor();


        console.log('- Test custom function');
        // custom function mapping
        // objectOutput.oCustomFn = input.iCustomFn;
        await dm.mapFields('input.iCustomFn', 'objectOutput.oCustomFn','menu-item-o2o-func');
        
        await dmWebView.getByTestId('link-from-input.iCustomFn.OUT-to-datamapper-intermediate-port').waitFor({ state: 'attached' });
        await dmWebView.getByTestId('link-from-datamapper-intermediate-port-to-objectOutput.oCustomFn.IN').waitFor({ state: 'attached' });
        await dmWebView.getByTestId('link-connector-node-objectOutput.oCustomFn.IN').waitFor();

        const editorTab = page.page.getByRole('tab', { name: `${DM_NAME}.ts, Editor Group` });
        await editorTab.waitFor({ state: 'attached' });

        await editorTab.locator('.codicon-close').click();
        await editorTab.waitFor({ state: 'detached' });

        expect(dm.verifyTsFileContent('basic/map.ts')).toBeTruthy();


        console.log('- Test basic mapping delete');

        await loc0.click({ force: true });
        await dmWebView.getByTestId('expression-label-for-input.iPrimDirect.OUT-to-objectOutput.oPrimDirect.IN')
          .locator('.codicon-trash').click({ force: true });
        await loc0.waitFor({ state: 'detached' });

        await loc1.click({ force: true });
        await dmWebView.getByTestId('expression-label-for-input.iPrimDirectErr.OUT-to-objectOutput.oPrimDirectErr.IN')
          .locator('.codicon-trash').click({ force: true });
        await loc1.waitFor({ state: 'detached' });

        await loc2.locator('.codicon-trash').click({ force: true });
        await loc2.waitFor({ state: 'detached' });

        const loc3_ = dmWebView.getByTestId('link-from-input.iManyOne3.OUT-to-datamapper-intermediate-port');
        await loc3_.click({ force: true });
        await dmWebView.locator('div[data-testid^="sub-link-label-for-input.iManyOne3.OUT-to-"]')
          .locator('.codicon-trash').click({ force: true });
        await loc3_.waitFor({ state: 'detached' });

        await loc4.locator('.codicon-trash').click({ force: true });
        await loc4.waitFor({ state: 'detached' });

        expect(dm.verifyTsFileContent('basic/del.ts')).toBeTruthy();
     
        // await dmWebView.locator('#nav-bar-main').locator('vscode-button[title="Go Back"]').click();
        // await page.page.getByRole('tab', { name: 'Resource View' }).waitFor();
        dm.resetTsFile();


        // if (NEED_INITIAL_SETUP) {
        //   await dmWebView.locator('vscode-button[title="Go Back"]').click();
        // }

      });
    }

    function testArrayMappings() {
      test('Test Array Mappings', async () => {

        // await page.page.getByRole('tab', { name: 'Project Overview' }).waitFor();

        console.log('Testing Array Mappings - Part 1');

        const DM_NAME = 'dm' + test.info().retry + 1;

        // overwriteTsFile('array/map2.ts');
        // overwriteTsFile('array/init1.ts');
        // overwriteTsFile('reset.ts');
        // overwriteTsFile('array/init2.ts');

        const projectExplorer = new ProjectExplorer(page.page);
        await projectExplorer.findItem(['Project testProject', 'Other Artifacts', 'Data Mappers', DM_NAME], true);
        const dm = new DataMapper(page.page, DM_NAME);
        await dm.init();
        const dmWebView = dm.getWebView();


        console.log('- Load input schemas from JSON data');
        await dm.importSchema(IOType.Input, SchemaType.Json, 'array/inp.json');

        console.log('- Load output schemas from JSON schema');
        await dm.importSchema(IOType.Output, SchemaType.JsonSchema, 'array/out1.schema.json');

        expect(dm.verifyTsFileContent('array/init1.ts')).toBeTruthy();
       

        console.log('- Test direct');
        // primitive direct array mapping , PrimDirect1D
        await dm.mapFields('input.iPrimDirect1D', 'objectOutput.oPrimDirect1D','menu-item-a2a-direct');
        // await dm.waitForProgressEnd();
        await dmWebView.getByTestId('link-from-input.iPrimDirect1D.OUT-to-objectOutput.oPrimDirect1D.IN').waitFor({ state: 'attached' });

        console.log('- Test mapping function');
        // primitive array mapping with mapping function, PrimMapFn1D
        await dm.mapFields('input.iPrimMapFn1D', 'objectOutput.oPrimMapFn1D','menu-item-a2a-inner');

        await dm.mapFields('focusedInput.iPrimMapFn1DItem', 'primitiveOutput.number');
        await dmWebView.getByTestId('link-from-focusedInput.iPrimMapFn1DItem.OUT-to-primitiveOutput.number.IN').waitFor({ state: 'attached' });

        await dmWebView.getByTestId('dm-header-breadcrumb-0').click();
        await clearNotificationsByCloseButton(page);

        // object array mapping with mapping function, ObjMapFn1D
        await dm.mapFields('input.iObjMapFn1D', 'objectOutput.oObjMapFn1D','menu-item-a2a-inner');

        await dm.mapFields('focusedInput.iObjMapFn1DItem.p1', 'objectOutput.q1');
        await dmWebView.getByTestId('link-from-focusedInput.iObjMapFn1DItem.p1.OUT-to-objectOutput.q1.IN').waitFor({ state: 'attached' });

        await dm.mapFields('focusedInput.iObjMapFn1DItem.p2', 'objectOutput.q2','menu-item-a2a-inner');
  
        await dm.mapFields('focusedInput.p2Item', 'primitiveOutput.string');
        await dmWebView.getByTestId('link-from-focusedInput.p2Item.OUT-to-primitiveOutput.string.IN').waitFor({ state: 'attached' });

        await dm.gotoPreviousView();
        await dm.gotoPreviousView();


        console.log('- Test init');
        // Initialize 1d array and map, InitPrim1D
        await dm.selectConfigMenuItem('objectOutput.oInitPrim1D', 'Initialize Array With Element');
       
        await dm.mapFields('input.iInitPrim', 'objectOutput.oInitPrim1D.0');
        // await dm.waitForProgressEnd();
        await dmWebView.getByTestId('link-from-input.iInitPrim.OUT-to-objectOutput.oInitPrim1D.0.IN').waitFor({ state: 'attached' });

        // Initialize 2d array and map, InitPrim2D
        
        await dm.selectConfigMenuItem('objectOutput.oInitPrim2D', 'Initialize Array With Element');
        await dmWebView.getByTestId('array-widget-objectOutput.oInitPrim2D.IN-values').getByText('Add Element').click();
        await dm.selectConfigMenuItem('objectOutput.oInitPrim2D.1', 'Add Element');

        await dm.mapFields('input.iInitPrim', 'objectOutput.oInitPrim2D.1.0');
        // await dm.waitForProgressEnd();
        await dmWebView.getByTestId('link-from-input.iInitPrim.OUT-to-objectOutput.oInitPrim2D.1.0.IN').waitFor({ state: 'attached' });

        expect(dm.verifyTsFileContent('array/map1.ts')).toBeTruthy();


        console.log('Test array mapping delete - Part 1');

        const loc2 = dmWebView.getByTestId('array-connector-node-objectOutput.oPrimMapFn1D.IN');
        await loc2.locator('.codicon-trash').click({ force: true });
        await loc2.waitFor({ state: 'detached' });

        const loc3 = dmWebView.getByTestId('array-connector-node-objectOutput.oObjMapFn1D.IN');
        await loc3.getByTestId('expand-array-fn-oObjMapFn1D').click({ force: true });
        const loc3I1 = dmWebView.getByTestId('array-connector-node-objectOutput.q2.IN');
        await loc3I1.getByTestId('expand-array-fn-q2').click({ force: true });

        const loc3I1I1 = dmWebView.getByTestId('link-from-focusedInput.p2Item.OUT-to-primitiveOutput.string.IN');
        await loc3I1I1.click({ force: true });
        await dmWebView.getByTestId('expression-label-for-focusedInput.p2Item.OUT-to-primitiveOutput.string.IN')
          .locator('.codicon-trash').click({ force: true });
        await loc3I1I1.waitFor({ state: 'detached' });
        await dm.gotoPreviousView();

        await loc3I1.locator('.codicon-trash').click({ force: true });
        await loc3I1.waitFor({ state: 'detached' });
        await dm.gotoPreviousView();

        await loc3.locator('.codicon-trash').click({ force: true });
        await loc3.waitFor({ state: 'detached' });

        const loc4 = dmWebView.getByTestId('link-from-input.iInitPrim.OUT-to-objectOutput.oInitPrim1D.0.IN');
        await loc4.click({ force: true });
        await dmWebView.getByTestId('expression-label-for-input.iInitPrim.OUT-to-objectOutput.oInitPrim1D.0.IN')
          .locator('.codicon-trash').click({ force: true });
        await loc4.waitFor({ state: 'detached' });
        
        const loc5 = dmWebView.getByTestId('link-from-input.iInitPrim.OUT-to-objectOutput.oInitPrim2D.1.0.IN');
        await loc5.click({ force: true });
        await dmWebView.getByTestId('expression-label-for-input.iInitPrim.OUT-to-objectOutput.oInitPrim2D.1.0.IN')
          .locator('.codicon-trash').click({ force: true });
        await loc5.waitFor({ state: 'detached' });

        // await page.page.pause();
        expect(dm.verifyTsFileContent('array/del1.ts')).toBeTruthy();
 

        console.log('Testing Array Mappings - Part 2');

        await dm.editSchema(IOType.Output, SchemaType.JsonSchema, 'array/out2.schema.json');

        // await page.page.pause();
        expect(dm.verifyTsFileContent('array/init2.ts')).toBeTruthy();

        // Init array object and map, InitObj1D
        await dm.selectConfigMenuItem('objectOutput.oInitObj1D', 'Initialize Array With Element');
        await dm.mapFields('input.iInitPrim', 'objectOutput.oInitObj1D.0.p1');
        await dmWebView.getByTestId('link-from-input.iInitPrim.OUT-to-objectOutput.oInitObj1D.0.p1.IN').waitFor({ state: 'attached' });

        // Fails intermittently
        // await dm.selectConfigMenuItem('objectOutput.oInitObj1D.0.p2', 'Initialize Array With Element');
        // await dm.mapFields('input.iInitPrim', 'objectOutput.oInitObj1D.0.p2.0');
        // await dmWebView.getByTestId('link-from-input.iInitPrim.OUT-to-objectOutput.oInitObj1D.0.p2.0.IN').waitFor({ state: 'attached' });

        await dmWebView.getByTestId('array-widget-objectOutput.oInitObj1D.IN-values').getByText('Add Element').click();
        await dm.waitForProgressEnd();
        await dm.mapFields('input.iInitObj', 'objectOutput.oInitObj1D.1','menu-item-o2o-direct');
        await dmWebView.getByTestId('link-from-input.iInitObj.OUT-to-objectOutput.oInitObj1D.1.IN').waitFor({ state: 'attached' });


        // 2D array direct mapping -redundant
        // await dmWebView.locator('[id="recordfield-input\\.d2I"]').click();
        // await dm.scrollClickOutput(dmWebView.getByTestId('array-type-editable-record-field-objectOutput.d2O.IN').locator('i'));
        // await dmWebView.locator('#menu-item-a2a-direct').click();
        // await dm.waitForProgressEnd();
        // await dmWebView.getByTestId('link-from-input.d2I.OUT-to-objectOutput.d2O.IN').waitFor({ state: 'attached' });


        // 2D - 1D array direct mapping (singleton access) 30-38 - redundant
        // await dmWebView.locator('[id="recordfield-input\\.s21I"]').click();
        // await dm.scrollClickOutput(dmWebView.getByTestId('array-type-editable-record-field-objectOutput.s21O.IN').locator('i'));
        // await dm.waitForProgressEnd();
        // await dmWebView.getByTestId('link-from-input.s21I.OUT-to-datamapper-intermediate-port').waitFor({ state: 'attached' });
        // await dmWebView.getByTestId('link-from-datamapper-intermediate-port-to-objectOutput.s21O.IN').waitFor({ state: 'attached' });
        // await dmWebView.getByTestId('link-connector-node-objectOutput.s21O.IN').waitFor({ state: 'attached' });

        // 2D array mapping with mapping function PrimMapFn2D
        await dm.mapFields('input.iPrimMapFn2D', 'objectOutput.oPrimMapFn2D', 'menu-item-a2a-inner');

        await dm.mapFields('focusedInput.iPrimMapFn2DItem', 'arrayOutput', 'menu-item-a2a-inner');

        await dm.mapFields('focusedInput.iPrimMapFn2DItemItem', 'primitiveOutput.number');
        await dmWebView.getByTestId('link-from-focusedInput.iPrimMapFn2DItemItem.OUT-to-primitiveOutput.number.IN').waitFor({ state: 'attached' });

        await dm.gotoPreviousView();
        await dm.gotoPreviousView();

        // 1D - 0D array direct mapping (singleton access) Single
        await dm.mapFields('input.iSingle1D', 'objectOutput.oSingle', 'menu-item-a2s-direct');

        await dmWebView.getByTestId('link-from-input.iSingle1D.OUT-to-datamapper-intermediate-port').waitFor({ state: 'attached' });
        await dmWebView.getByTestId('link-from-datamapper-intermediate-port-to-objectOutput.oSingle.IN').waitFor({ state: 'attached' });
        const loc10 = dmWebView.getByTestId('link-connector-node-objectOutput.oSingle.IN');
        await loc10.waitFor();

        // 1D - 0D array direct mapping (edit singleton index)
        const loc10Indx = loc10.getByTitle('indexing');
        await loc10Indx.click({ force: true });
        const expressionBar = dmWebView.locator('#expression-bar').getByRole('textbox', { name: 'Text field' });
        await expect(expressionBar).toBeFocused();
        await expressionBar.fill('input.iSingle1D[1]');
        await dmWebView.locator('#data-mapper-canvas-container').click();
        await expect(expressionBar).not.toBeFocused();
        await expect(loc10Indx).toHaveText('[1]');

        // await page.page.pause();
        // expect(dm.verifyTsFileContent('array/map2.ts')).toBeTruthy();


        console.log('Test array mapping delete - Part 2');

        const loc6 = dmWebView.getByTestId('link-from-input.iInitPrim.OUT-to-objectOutput.oInitObj1D.0.p1.IN');
        await loc6.click({ force: true });
        await dmWebView.getByTestId('expression-label-for-input.iInitPrim.OUT-to-objectOutput.oInitObj1D.0.p1.IN')
          .locator('.codicon-trash').click({ force: true });
        await loc6.waitFor({ state: 'detached' });

        // Fails intermittently
        // const loc7 = dmWebView.getByTestId('link-from-input.iInitPrim.OUT-to-objectOutput.oInitObj1D.0.p2.0.IN');
        // await loc7.click({ force: true });
        // await dmWebView.getByTestId('expression-label-for-input.iInitPrim.OUT-to-objectOutput.oInitObj1D.0.p2.0.IN')
        //   .locator('.codicon-trash').click();
        // await loc7.waitFor({ state: 'detached' });

        const loc8 = dmWebView.getByTestId('link-from-input.iInitObj.OUT-to-objectOutput.oInitObj1D.1.IN');
        await loc8.click({ force: true });
        await dmWebView.getByTestId('expression-label-for-input.iInitObj.OUT-to-objectOutput.oInitObj1D.1.IN')
          .locator('.codicon-trash').click();
        await loc8.waitFor({ state: 'detached' });

        const loc9 = dmWebView.getByTestId('array-connector-node-objectOutput.oPrimMapFn2D.IN');
        await loc9.getByTestId('expand-array-fn-oPrimMapFn2D').click({ force: true });
        const loc9I1 = dmWebView.getByTestId('array-connector-node-arrayOutput.IN');
        await loc9I1.locator('[data-testid^="expand-array-fn-"]').click({ force: true });

        const loc9I1I1 = dmWebView.getByTestId('link-from-focusedInput.iPrimMapFn2DItemItem.OUT-to-primitiveOutput.number.IN');
        await loc9I1I1.click({ force: true });
        await dmWebView.getByTestId('expression-label-for-focusedInput.iPrimMapFn2DItemItem.OUT-to-primitiveOutput.number.IN')
          .locator('.codicon-trash').click({ force: true });
        await loc9I1I1.waitFor({ state: 'detached' });
        await dm.gotoPreviousView();

        await loc9I1.locator('.codicon-trash').click({ force: true });
        await loc9I1.waitFor({ state: 'detached' });
        await dm.gotoPreviousView();

        await loc9.locator('.codicon-trash').click({ force: true });
        await loc9.waitFor({ state: 'detached' });

        await loc10.locator('.codicon-trash').click({ force: true });
        await loc10.waitFor({ state: 'detached' });

        // await page.page.pause();
        // expect(dm.verifyTsFileContent('array/del2.ts')).toBeTruthy();

        dm.resetTsFile();

      });
    }

    function testImportOptions(){
      test('Test Import Options', async () => {

        // await page.page.getByRole('tab', { name: 'Project Overview' }).waitFor();

        console.log('Testing Import Options');

        const DM_NAME = 'dm' + test.info().retry + 1;

        const projectExplorer = new ProjectExplorer(page.page);
        await projectExplorer.findItem(['Project testProject', 'Other Artifacts', 'Data Mappers', DM_NAME], true);
        const dm = new DataMapper(page.page, DM_NAME);
        await dm.init();

        console.log('- Load input schemas from XML');
        await dm.importSchema(IOType.Input, SchemaType.Xml, 'schemas/data.xml');

        console.log('- Load output schemas from CSV');
        await dm.importSchema(IOType.Output, SchemaType.Csv, 'schemas/data.csv');

        expect(dm.verifyTsFileContent('schemas/xml-csv.ts')).toBeTruthy();

        console.log('- Load input schemas from XSD');
        await dm.editSchema(IOType.Input, SchemaType.Xsd, 'schemas/schema.xsd');
        
        expect(dm.verifyTsFileContent('schemas/xsd-csv.ts')).toBeTruthy();

      });
      

    }

    function overwriteTsFile(newTsFile: string) {
      const tsFile = path.join(newProjectPath, 'testProject', 'src', 'main', 'wso2mi', 'resources', 'datamapper', 'dm', 'dm.ts');
      const dmDataFolder = path.join(dataFolder, 'datamapper-files');
      fs.writeFileSync(tsFile, fs.readFileSync(path.join(dmDataFolder, newTsFile),'utf8'));
    }

  }
  );
}
