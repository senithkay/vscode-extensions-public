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
import { Automation } from '../components/ArtifactTest/Automation';
import { Endpoint } from '../components/ArtifactTest/Endpoint';
import { Sequence } from '../components/ArtifactTest/Sequence';
import { ClassMediator } from '../components/ArtifactTest/ClassMediator';
import { BallerinaModule } from '../components/ArtifactTest/BallerinaModule';
import { Resource } from '../components/ArtifactTest/Resource';
import { MessageStore } from '../components/ArtifactTest/MessageStore';
import { MessageProcessor } from '../components/ArtifactTest/MessageProcessor';
import { LocalEntry } from '../components/ArtifactTest/LocalEntry';
import { Template } from '../components/ArtifactTest/Template';
import { Proxy } from '../components/ArtifactTest/Proxy';
import { DataSource } from '../components/ArtifactTest/DataSource';
import { DataService } from '../components/ArtifactTest/DataService';

export default function createTests() {
  test.describe('Artifact Tests', async () => {
    initTest(false);

    let automation: Automation;
    test('Automation tests', async () => {
      await test.step('Add Automation', async () => {
        console.log('Creating new Automation');
        automation = new Automation(page.page);
        await automation.init();
        await automation.add();
      });
      await test.step('Edit Automation', async () => {
        console.log('Editing Automation');
        await automation.edit();
      });
    });

    test('Endpoint tests', async () => {
      let lb: Endpoint;
      await test.step('Add http Endpoint', async () => {
        console.log('Creating new http Endpoint');
        lb = new Endpoint(page.page);
        await lb.init();
        await lb.addHttpEndpoint();
      });
      await test.step('Edit http Endpoint', async () => {
        console.log('Editing http Endpoint');
        await lb.editHttpEndpoint();
      });
      await test.step('Add load balance Endpoint', async () => {
        console.log('Creating new load balance Endpoint');
        await lb.addLoadBalanceEndpoint();
      });
      await test.step('Edit load balance Endpoint', async () => {
        console.log('Editing load balance Endpoint');
        await lb.editLoadBalanceEndpoint();
      });
    });

    test('Sequence tests', async () => {
      let sequence: Sequence;
      await test.step('Add Sequence', async () => {
        console.log('Creating new Sequence');
        sequence = new Sequence(page.page);
        await sequence.init();
        await sequence.add();
      });
      await test.step('Edit Sequence', async () => {
        console.log('Editing Sequence');
        await sequence.edit();
      });
    });

    test('Add Class Mediator', async () => {
      console.log('Creating new Class Mediator');
      const classMediator = new ClassMediator(page.page);
      await classMediator.init();
      await classMediator.add();
    });

    test('Add Ballerina Module', async () => {
      console.log('Creating new Ballerina Module');
      const ballerinaModule = new BallerinaModule(page.page);
      await ballerinaModule.init();
      await ballerinaModule.add();
    });

    test('Add Resource', async () => {
      console.log('Creating new Resource');
      const resource = new Resource(page.page);
      await resource.init();
      await resource.add();
    });

    test('Message Store tests', async () => {
      let ms: MessageStore;
      await test.step('Add Message Store', async () => {
        console.log('Creating new Message Store');
        ms = new MessageStore(page.page);
        await ms.init();
        await ms.addInMemmoryMS();
      });
      await test.step('Edit Message Store', async () => {
        console.log('Editing Message Store');
        await ms.editInMemoryMS();
      });

      let msp: MessageProcessor;
      await test.step('Add Message Processor', async () => {
        console.log('Creating new Message Processor');
        msp = new MessageProcessor(page.page);
        await msp.init();
        await msp.addMessageSamplingProcessor();
      });
      await test.step('Edit Message Processor', async () => {
        console.log('Editing Message Processor');
        await msp.editMessageSamplingProcessor();
      });
    });

    test('Local Entry tests', async () => {
      let localEntry: LocalEntry;
      await test.step('Add Local Entry', async () => {
        console.log('Creating new Local Entry');
        localEntry = new LocalEntry(page.page);
        await localEntry.init();
        await localEntry.addLocalEntry();
      });
      await test.step('Edit Local Entry', async () => {
        console.log('Editing Local Entry');
        await localEntry.editLocalEntry();
      });
    });

    test('Template tests', async () => {
      let template: Template;
      await test.step('Add Template', async () => {
        console.log('Creating new Template');
        template = new Template(page.page);
        await template.init();
        await template.addTemplate();
      });
      await test.step('Edit Template', async () => {
        console.log('Editing Template');
        await template.editTemplate();
      });
    });

    // TODO: Enable this test after fixing the issue with the proxy service
    // let proxyService: Proxy;
    // test('Add Proxy Service', async () => {
    //   console.log('Creating new Proxy Service');
    //   proxyService = new Proxy(page.page);
    //   await proxyService.init();
    //   await proxyService.add();
    // });
    // await test.step('Edit Proxy Service', async () => {
    //   console.log('Editing Proxy Service');
    //   await proxyService.edit();
    // });

    test('Add Data Source', async () => {
      let dataSource: DataSource;
      await test.step('Add Data Source', async () => {
        console.log('Creating new Data Source');
        dataSource = new DataSource(page.page);
        await dataSource.init();
        await dataSource.add();
      });
      await test.step('Edit Data Source', async () => {
        console.log('Editing Data Source');
        await dataSource.edit();
      });
    });

    test('Add Data Service', async () => {
      await test.step('Add Data Service', async () => {
        console.log('Creating new Data Service');
        const dataService = new DataService(page.page);
        await dataService.init();
        await dataService.add();
      });
      await test.step('Edit Data Service', async () => {
        console.log('Editing Data Service');
        const dataService = new DataService(page.page);
        await dataService.edit();
      });
    });
  });
}
