/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { test } from '@playwright/test';
import { initTest, page } from '../Utils';
import path from 'path';
import { Registry } from '../components/ArtifactTest/Registry';

export default function createTests() {
  test.describe('Artifact Tests', async () => {
    initTest(true, true, false, 'testProject430', '4.3.0');

    test('Registry Tests from 4.3.0 runtime', async () => {
      const testAttempt = test.info().retry + 1;
      await test.step('Create new registry from artifacts', async () => {
        console.log('Creating new registry from artifacts');
        const registry = new Registry(page.page);
        await registry.openFormFromArtifacts();
        await registry.addFromTemplate({
          name: 'testRegistry1' + testAttempt,
          templateType: 'JSON File',
          registryType: 'gov',
          registryPath: 'json',
        });
      });

      await test.step('Create new registry from side panel', async () => {
        console.log('Create new registry from side panel');
        const registry = new Registry(page.page);
        await registry.openFormFromSidePanel();
        await registry.addFromTemplate({
          name: 'testRegistry2' + testAttempt,
          templateType: 'JSON File',
          registryType: 'conf',
          registryPath: 'json',
        });
      });

      await test.step('Create new registry importing a file', async () => {
        console.log('Create new registry importing a file');
        const registry = new Registry(page.page);
        await registry.openFormFromArtifacts();
        const filePath = path.join(__dirname, '..', 'data', 'new-project', 'testProject', 'testProject430', 'src', 'main', 'wso2mi', 'resources', 'registry', 'gov', 'json', 'testRegistry1' + testAttempt + '.json');
        await registry.addFromFileSystem({
          filePath: filePath,
          registryType: 'conf',
          registryPath: 'newJson'
        })
      });
    });
  });
}
