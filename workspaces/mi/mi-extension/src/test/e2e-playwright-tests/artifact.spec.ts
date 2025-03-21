/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { test } from '@playwright/test';
import { createProject, initVSCode, newProjectPath, page, resourcesFolder } from './Utils';
import fs from 'fs';
import path from 'path';
import { Automation } from './components/ArtifactTest/Automation';
import { Endpoint } from './components/ArtifactTest/Endpoint';
import { Sequence } from './components/ArtifactTest/Sequence';
test.describe.configure({ mode: 'serial' });

test.beforeAll(async () => {
  console.log('Starting Artifact tests');
  // delete and recreate folder
  if (fs.existsSync(newProjectPath)) {
    fs.rmSync(newProjectPath, { recursive: true });
  }
  fs.mkdirSync(newProjectPath, { recursive: true });
  await initVSCode();
});

test('Create new project', async () => {
  await createProject(page);
});

let automation: Automation;
test('Add Automation', async () => {
  console.log('Creating new Automation');
  automation = new Automation(page.page);
  await automation.init();
  await automation.add();
});
test('Edit Automation', async () => {
  console.log('Editing Automation');
  await automation.edit();
});

let lb: Endpoint;
test('Add http Endpoint', async () => {
  console.log('Creating new http Endpoint');
  lb = new Endpoint(page.page);
  await lb.init();
  await lb.addHttpEndpoint();
});

test('Edit http Endpoint', async () => {
  console.log('Editing http Endpoint');
  await lb.editHttpEndpoint();
});
test('Add load balance Endpoint', async () => {
  console.log('Creating new load balance Endpoint');
  await lb.addLoadBalanceEndpoint();
});
test('Edit load balance Endpoint', async () => {
  console.log('Editing load balance Endpoint');
  await lb.editLoadBalanceEndpoint();
});

let sequence: Sequence;
test('Add Sequence', async () => {
  console.log('Creating new Sequence');
  sequence = new Sequence(page.page);
  await sequence.init();
  await sequence.add();
});
test('Edit Sequence', async () => {
  console.log('Editing Sequence');
  await sequence.edit();
});

// let eventIntegration: EventIntegration;
// test('Add Event Integration', async () => {
//   eventIntegration = new EventIntegration(page.page);
//   await eventIntegration.init();
//   await eventIntegration.add();
// });

test.afterAll(async () => {
  const videoTitle = `artifact_test_suite_${new Date().toLocaleString().replace(/,|:|\/| /g, '_')}`;
  const video = page.page.video();
  const videoDir = path.resolve(resourcesFolder, 'videos');
  const videoPath = await video?.path();

  if (video && videoPath) {
    video?.saveAs(path.resolve(videoDir, `${videoTitle}.webm`));
  }

  // cleanup
  if (fs.existsSync(newProjectPath)) {
    fs.rmSync(newProjectPath, { recursive: true });
  }
  console.log('Automation tests completed');
});
