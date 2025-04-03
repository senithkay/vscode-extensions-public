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
import { clearNotificationAlerts, clearNotificationsByCloseButton, initTest, newProjectPath, page, resourcesFolder, vscode } from './Utils';
import { DataMapper } from './components/DataMapper';

const fs = require('fs');

export default function createTests() {

  test.describe('Data Mapper Tests', () => {
    const NEED_INITIAL_SETUP = true;
    const NEED_CLEANUP = true;

    initTest(true, true);

    if (NEED_INITIAL_SETUP) setupProject();
    testBasicMappings();
   
    function setupProject() {
      test('Setup project for Data Mapper', async () => {

        test.step('Create new API', async () => {

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
  
        test.step('Service designer', async () => {
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
      test('Try Basic Mappings', async () => {

        console.log('Trying Basic Mappings');

        let dm: DataMapper;
        const DM_NAME = 'basic';

        await clearNotificationsByCloseButton(page);

        const diagram = new Diagram(page.page, 'Resource');
        await diagram.init();

        if (NEED_INITIAL_SETUP) {
          await diagram.addDataMapper(DM_NAME);
          dm = new DataMapper(page.page, DM_NAME);
          await dm.init();
          await dm.loadJsonFromCompFolder();
          expect(dm.verifyTsFileContent('init.ts.cmp')).toBeTruthy();
        } else {
          await diagram.openDataMapperFromTreeView(DM_NAME);
          dm = new DataMapper(page.page, DM_NAME);
          await dm.init();
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


        expect(dm.verifyTsFileContent('map.ts.cmp')).toBeTruthy();

        if (NEED_INITIAL_SETUP) {
          await dmWebView.locator('vscode-button[title="Go Back"]').click();
        }

      });
    }

  }
  );
}
