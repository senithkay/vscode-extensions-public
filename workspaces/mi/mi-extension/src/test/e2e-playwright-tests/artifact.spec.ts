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
import { ClassMediator } from './components/ArtifactTest/ClassMediator';
import { BallerinaModule } from './components/ArtifactTest/BallerinaModule';
import { Resource } from './components/ArtifactTest/Resource';
import { MessageProcessor } from './components/ArtifactTest/MessageProcessor';
import { MessageStore } from './components/ArtifactTest/MessageStore';
import { LocalEntry } from './components/ArtifactTest/LocalEntry';
import { Template } from './components/ArtifactTest/Template';
import { Proxy } from './components/ArtifactTest/Proxy';
import { DataSource } from './components/ArtifactTest/DataSource';
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

let classMediator: ClassMediator;
test('Add Class Mediator', async () => {
  console.log('Creating new Class Mediator');
  classMediator = new ClassMediator(page.page);
  await classMediator.init();
  await classMediator.add();
});

let ballerinaModule: BallerinaModule;
test('Add Ballerina Module', async () => {
  console.log('Creating new Ballerina Module');
  ballerinaModule = new BallerinaModule(page.page);
  await ballerinaModule.init();
  await ballerinaModule.add();
});

let resource: Resource;
test('Add Resource', async () => {
  console.log('Creating new Resource');
  resource = new Resource(page.page);
  await resource.init();
  await resource.add();
});

let ms: MessageStore;
test('Add Message Store', async () => {
  console.log('Creating new Message Store');
  ms = new MessageStore(page.page);
  await ms.init();
  await ms.addInMemmoryMS();
});
test('Edit Message Store', async () => {
  console.log('Editing Message Store');
  await ms.editInMemoryMS();
});

let msp: MessageProcessor;
test('Add Message Processor', async () => {
  console.log('Creating new Message Processor');
  msp = new MessageProcessor(page.page);
  await msp.init();
  await msp.addMessageSamplingProcessor();
});
test('Edit Message Processor', async () => {
  console.log('Editing Message Processor');
  await msp.editMessageSamplingProcessor();
});

let localEntry: LocalEntry;
test('Add Local Entry', async () => {
  console.log('Creating new Local Entry');
  localEntry = new LocalEntry(page.page);
  await localEntry.init();
  await localEntry.addLocalEntry();
});
test('Edit Local Entry', async () => {
  console.log('Editing Local Entry');
  await localEntry.editLocalEntry();
});

let template: Template;
test('Add Template', async () => {
  console.log('Creating new Template');
  template = new Template(page.page);
  await template.init();
  await template.addTemplate();
});
test('Edit Template', async () => {
  console.log('Editing Template');
  await template.editTemplate();
});

let proxyService: Proxy;
test('Add Proxy Service', async () => {
  console.log('Creating new Proxy Service');
  proxyService = new Proxy(page.page);
  await proxyService.init();
  await proxyService.add();
});
test('Edit Proxy Service', async () => {
  console.log('Editing Proxy Service');
  await proxyService.edit();
});

let dataSource: DataSource;
test('Add Data Source', async () => {
  console.log('Creating new Data Source');
  dataSource = new DataSource(page.page);
  await dataSource.init();
  await dataSource.add();
});
test('Edit Data Source', async () => {
  console.log('Editing Data Source');
  await dataSource.edit();
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
