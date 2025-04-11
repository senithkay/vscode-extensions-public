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
import { clearNotificationAlerts, clearNotificationsByCloseButton, initTest, newProjectPath, page, resourcesFolder, vscode } from './Utils';
import { DataMapper, IOType, SchemaType } from './components/DataMapper';
import { ProjectExplorer } from './components/ProjectExplorer';

const fs = require('fs');

export default function createTests() {

  test.describe('Data Mapper Tests', () => {
    const NEED_INITIAL_SETUP = true;

    initTest(NEED_INITIAL_SETUP);

    if (NEED_INITIAL_SETUP) setupProject();
    testBasicMappings();
    testArrayMappings();
    testImportOptions();
    
   
    function setupProject() {
      test('Setup project for Data Mapper', async () => {

        await test.step('Create new API', async () => {

          console.log('Creating new API for datamapper');
  
          const overviewPage = new AddArtifact(page.page);
          await overviewPage.init();
          await overviewPage.add('API');
  
          const apiForm = new Form(page.page, 'API Form');
          await apiForm.switchToFormView();
          await apiForm.fill({
            values: {
              'Name*': {
                type: 'input',
                value: 'dmApi',
              },
              'Context*': {
                type: 'input',
                value: '/dmApi',
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
        const DM_NAME = 'dm';

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
          const projectExplorer = new ProjectExplorer(page.page);
          await projectExplorer.findItem(['Project testProject', 'Other Artifacts', 'Data Mappers', DM_NAME], true);
          dm = new DataMapper(page.page, DM_NAME);
          await dm.init();
        }

        const dmWebView = dm.getWebView();

        console.log('- Test direct mappings');

        // direct mapping
        // objectOutput.dmO = input.dmI;
        await dm.mapFields('input.dmI', 'objectOutput.dmO');
        await dmWebView.getByTestId('link-from-input.dmI.OUT-to-objectOutput.dmO.IN').waitFor({ state: 'attached' });

        // direct mapping with error
        // objectOutput.dmeO = input.dmeI;
        await dm.mapFields('input.dmeI', 'objectOutput.dmeO');
        await dm.expectErrorLink(dmWebView.getByTestId('link-from-input.dmeI.OUT-to-objectOutput.dmeO.IN'));

        await clearNotificationsByCloseButton(page);

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
        await dmWebView.locator('[id="recordfield-input\\.odmI"] i').nth(1).click();
        await dmWebView.locator('[id="recordfield-objectOutput\\.odmO"] i').first().click();
        const menuItemDirect = dmWebView.locator('#menu-item-o2o-direct');
        await menuItemDirect.click();
        await menuItemDirect.waitFor({ state: 'detached' });
        await dmWebView.getByTestId('link-from-input.odmI.OUT-to-objectOutput.odmO.IN').waitFor({ state: 'attached' });

        // object direct mapping with error
        // objectOutput.odmeO = input.odmI
        await dmWebView.locator('[id="recordfield-input\\.odmI"] i').nth(1).click();
        await dmWebView.locator('[id="recordfield-objectOutput\\.odmeO"] i').first().click();
        await menuItemDirect.click();
        await menuItemDirect.waitFor({ state: 'detached' });
        await dm.expectErrorLink(dmWebView.getByTestId('link-from-input.odmI.OUT-to-objectOutput.odmeO.IN'));

        // object properties mapping
        // objectOutput.ompO.p1 = input.odmI.dm1;
        await dm.mapFields('input.odmI.dm1', 'objectOutput.ompO.p1');
        await dmWebView.getByTestId('link-from-input.odmI.dm1.OUT-to-objectOutput.ompO.p1.IN').waitFor({ state: 'attached' });

        // objectOutput.ompO.p2 = input.opmI.dm2;
        await dm.mapFields('input.opmI.op2', 'objectOutput.ompO.p2');
        await dmWebView.getByTestId('link-from-input.opmI.op2.OUT-to-objectOutput.ompO.p2.IN').waitFor({ state: 'attached' });

        console.log('- Test expression bar');

        // expression bar - use function
        await dmWebView.locator('[id="recordfield-objectOutput\\.expO"]').click();
        const expressionBar = dmWebView.locator('#expression-bar').getByRole('textbox', { name: 'Text field' });
        await expect(expressionBar).toBeFocused();
        await expressionBar.fill('toupper');
        await dmWebView.getByText('dmUtils toUppercaseConverts a').click();
        await expect(expressionBar).toHaveValue('dmUtils.toUppercase()');
        await expect(expressionBar).toBeFocused();

        await dmWebView.locator('[id="recordfield-input\\.expI"]').click();
        await expressionBar.press('Enter');
        await dmWebView.getByTestId('link-from-input.expI.OUT-to-datamapper-intermediate-port').waitFor({ state: 'attached' });
        await dmWebView.getByTestId('link-from-datamapper-intermediate-port-to-objectOutput.expO.IN').waitFor({ state: 'attached' });
        await dmWebView.getByTestId('link-connector-node-objectOutput.expO.IN').waitFor();

        // await expressionBar.press('Enter');
        await dmWebView.locator('#data-mapper-canvas-container').click();

        await expect(expressionBar).not.toBeFocused();

        // await page.page.pause();

        // expression editor - edit existing
        await dmWebView.locator('[id="recordfield-objectOutput\\.ompO\\.p1"]').click();
        await expect(expressionBar).toBeFocused();
        await expressionBar.fill('input.odmI.dm1 + "HI"');
        await dmWebView.locator('#data-mapper-canvas-container').click();
        await expect(expressionBar).not.toBeFocused();

        // await page.page.pause();

        await dmWebView.getByTestId('link-from-input.odmI.dm1.OUT-to-datamapper-intermediate-port').waitFor({ state: 'attached' });
        await dmWebView.getByTestId('link-from-datamapper-intermediate-port-to-objectOutput.ompO.p1.IN').waitFor({ state: 'attached' });
        await dmWebView.getByTestId('link-connector-node-objectOutput.ompO.p1.IN').waitFor();


        console.log('- Test custom function');
        // custom function mapping
        // objectOutput.cfnO = input.cfnI;
        await dm.mapFields('input.cfnI', 'objectOutput.cfnO','menu-item-o2o-func');
        
        await dmWebView.getByTestId('link-from-input.cfnI.OUT-to-datamapper-intermediate-port').waitFor({ state: 'attached' });
        await dmWebView.getByTestId('link-from-datamapper-intermediate-port-to-objectOutput.cfnO.IN').waitFor({ state: 'attached' });
        await dmWebView.getByTestId('link-connector-node-objectOutput.cfnO.IN').waitFor();

        const editorTab = page.page.getByRole('tab', { name: `${DM_NAME}.ts, Editor Group` });
        await editorTab.waitFor({ state: 'attached' });

        await editorTab.locator('.codicon-close').click();
        await editorTab.waitFor({ state: 'detached' });

        expect(dm.verifyTsFileContent('basic/map.ts')).toBeTruthy();
        
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

        console.log('Testing Array Mappings');

        const DM_NAME = 'dm';

        const projectExplorer = new ProjectExplorer(page.page);
        await projectExplorer.findItem(['Project testProject', 'Other Artifacts', 'Data Mappers', DM_NAME], true);
        const dm = new DataMapper(page.page, DM_NAME);
        await dm.init();

        console.log('- Load input schemas from JSON data');
        await dm.importSchema(IOType.Input, SchemaType.Json, 'array/inp.json');

        console.log('- Load output schemas from JSON schema');
        await dm.importSchema(IOType.Output, SchemaType.JsonSchema, 'array/out.schema.json');

        expect(dm.verifyTsFileContent('array/init.ts')).toBeTruthy();
       
        const dmWebView = dm.getWebView();

        console.log('- Test direct');
        // primitive direct array mapping
        await dm.mapFields('input.d1I', 'objectOutput.d1O','menu-item-a2a-direct');
        await dm.waitForProgressEnd();
        await dmWebView.getByTestId('link-from-input.d1I.OUT-to-objectOutput.d1O.IN').waitFor({ state: 'attached' });

        console.log('- Test mapping function');
        // primitive array mapping with mapping function
        await dm.mapFields('input.m1I', 'objectOutput.m1O','menu-item-a2a-inner');

        await dm.mapFields('focusedInput.m1IItem', 'primitiveOutput.number');
        await dmWebView.getByTestId('link-from-focusedInput.m1IItem.OUT-to-primitiveOutput.number.IN').waitFor({ state: 'attached' });

        await dmWebView.getByTestId('dm-header-breadcrumb-0').click();
        await clearNotificationsByCloseButton(page);

        // object array mapping with mapping function
        await dm.mapFields('input.m1objI', 'objectOutput.m1objO','menu-item-a2a-inner');

        await dm.mapFields('focusedInput.m1objIItem.p1', 'objectOutput.q1');
        await dmWebView.getByTestId('link-from-focusedInput.m1objIItem.p1.OUT-to-objectOutput.q1.IN').waitFor({ state: 'attached' });

        await dm.mapFields('focusedInput.m1objIItem.p2', 'objectOutput.q2','menu-item-a2a-inner');
  
        await dm.mapFields('focusedInput.p2Item', 'primitiveOutput.string');
        await dmWebView.getByTestId('link-from-focusedInput.p2Item.OUT-to-primitiveOutput.string.IN').waitFor({ state: 'attached' });

        await dm.gotoPreviousView();
        await dm.gotoPreviousView();


        console.log('- Test init');
        // Initialize 1d array and map
        await dm.selectConfigMenuItem('objectOutput.i1O', 'Initialize Array With Element');
       
        await dm.mapFields('input.i1I', 'objectOutput.i1O.0');
        await dm.waitForProgressEnd();
        await dmWebView.getByTestId('link-from-input.i1I.OUT-to-objectOutput.i1O.0.IN').waitFor({ state: 'attached' });

        // Initialize 2d array and map
        
        await dm.selectConfigMenuItem('objectOutput.i2O', 'Initialize Array With Element');
        await dmWebView.getByTestId('array-widget-objectOutput.i2O.IN-values').getByText('Add Element').click();
        await dm.selectConfigMenuItem('objectOutput.i2O.1', 'Add Element');

        await dm.mapFields('input.i1I', 'objectOutput.i2O.1.0');
        await dm.waitForProgressEnd();
        await dmWebView.getByTestId('link-from-input.i1I.OUT-to-objectOutput.i2O.1.0.IN').waitFor({ state: 'attached' });

        

        // Init array object and map scroll 
        await dm.selectConfigMenuItem('objectOutput.iobjO', 'Initialize Array With Element');

        await dmWebView.locator('[id="recordfield-input\\.i1I"]').click();
        await dm.scrollClickOutput(dmWebView.locator('[id="recordfield-objectOutput\\.iobjO\\.0\\.p1"]'));
        await dm.waitForProgressEnd();
        await dmWebView.getByTestId('link-from-input.i1I.OUT-to-objectOutput.iobjO.0.p1.IN').waitFor({ state: 'attached' });

        // working

        dm.resetTsFile();

        return;

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
        await dmWebView.locator('[id="recordfield-input\\.d2I"]').click();
        await dm.scrollClickOutput(dmWebView.getByTestId('array-type-editable-record-field-objectOutput.d2O.IN').locator('i'));
        await dmWebView.locator('#menu-item-a2a-direct').click();
        await dm.waitForProgressEnd();
        await dmWebView.getByTestId('link-from-input.d2I.OUT-to-objectOutput.d2O.IN').waitFor({ state: 'attached' });

        // 1D - 0D array direct mapping (singleton access)
        await dmWebView.locator('[id="recordfield-input\\.s10O"]').click();
        await dm.scrollClickOutput(dmWebView.locator('[id="recordfield-objectOutput\\.s10O"]').first());
        await dm.waitForProgressEnd();
        await dmWebView.getByTestId('link-from-input.s10O.OUT-to-datamapper-intermediate-port').waitFor({ state: 'attached' });
        await dmWebView.getByTestId('link-from-datamapper-intermediate-port-to-objectOutput.s10O.IN').waitFor({ state: 'attached' });
        await dmWebView.getByTestId('link-connector-node-objectOutput.s10O.IN').waitFor();

        // 2D - 1D array direct mapping (singleton access) 30-38
        await dmWebView.locator('[id="recordfield-input\\.s21I"]').click();
        await dm.scrollClickOutput(dmWebView.getByTestId('array-type-editable-record-field-objectOutput.s21O.IN').locator('i'));
        await dm.waitForProgressEnd();
        await dmWebView.getByTestId('link-from-input.s21I.OUT-to-datamapper-intermediate-port').waitFor({ state: 'attached' });
        await dmWebView.getByTestId('link-from-datamapper-intermediate-port-to-objectOutput.s21O.IN').waitFor({ state: 'attached' });
        await dmWebView.getByTestId('link-connector-node-objectOutput.s21O.IN').waitFor({ state: 'attached' });

        // 2D array mapping with mapping function 11-24
        await dmWebView.locator('[id="recordfield-input\\.m2I"]').click();
        await dmWebView.getByTestId('array-type-editable-record-field-objectOutput.m2O.IN').locator('i').click();
        await dmWebView.locator('#menu-item-a2a-inner').click();
        // await dm.waitForProgressEnd();
        // await dmWebView.getByTestId('link-from-input.m2I.OUT-to-datamapper-intermediate-port').waitFor({ state: 'attached' });
        // await dmWebView.getByTestId('link-from-datamapper-intermediate-port-to-objectOutput.m2O.IN').waitFor({ state: 'attached' });

        // await dmWebView.getByTestId('expand-array-fn-m2O').locator('i').click();
        await dmWebView.getByTestId('focusedInput.m2IItem-node').locator('i').click();
        await dmWebView.getByTestId('arrayOutput-node').locator('i').first().click();
        // await dmWebView.locator('#menu-item-a2a-inner').click();
        // await dm.waitForProgressEnd();
        // await dmWebView.getByTestId('link-from-focusedInput.m2IItem.OUT-to-datamapper-intermediate-port').waitFor({ state: 'attached' });
        // await dmWebView.getByTestId('link-from-datamapper-intermediate-port-to-arrayOutput.IN').waitFor({ state: 'attached' });

        // await dmWebView.getByTitle('Map array elements').locator('i').click();
        await dmWebView.getByTestId('focusedInput.m2IItemItem-node').locator('i').click();
        await dmWebView.getByTestId('primitiveOutput-node').locator('i').nth(1).click();
        await dm.waitForProgressEnd();
        await dmWebView.getByTestId('link-from-focusedInput.m2IItemItem.OUT-to-primitiveOutput.number.IN').waitFor({ state: 'attached' });

        await dmWebView.getByTestId('dm-header-breadcrumb-0').click();
        await dmWebView.getByTestId('dm-header-breadcrumb-0').waitFor({ state: 'detached' });

        expect(dm.verifyTsFileContent('array/map.ts')).toBeTruthy();

        if (NEED_INITIAL_SETUP) {
          await dmWebView.locator('vscode-button[title="Go Back"]').click();
        }

      });
    }

    function testImportOptions(){
      test('Test Import Options', async () => {

        // await page.page.getByRole('tab', { name: 'Project Overview' }).waitFor();

        console.log('Testing Import Options');

        const DM_NAME = 'dm';

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

  }
  );
}
