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
import { API } from '../components/ArtifactTest/API';
import { EventIntegration } from '../components/ArtifactTest/EventIntegration';
import { ImportArtifact } from '../components/ImportArtifact';
import path from "path";
const filePath = path.join( __dirname, '..', 'components', 'ArtifactTest', 'data', 'importApi_v1.0.0.xml');

export default function createTests() {
  test.describe('Artifact Tests', async () => {
    initTest();
    let currentTaskName: string = "TestTask";

    test('Automation tests', async ({ }, testInfo) => {
      let automation: Automation;
      const testAttempt = testInfo.retry + 1;
      await test.step('Add Automation', async () => {
        console.log('Creating new Automation');
        currentTaskName = "TestTask" + testAttempt;
        automation = new Automation(page.page);
        await automation.init();
        await automation.add("TestTask" + testAttempt);
      });
      await test.step('Edit Automation', async () => {
        console.log('Editing Automation');
        await automation.edit("NewTestTask" + testAttempt);
      });
      await test.step('Open Diagram View of Automation', async () => {
        console.log('Opening Diagram View of Automation');
        await automation.openDiagramView("NewTestTask" + testAttempt);
      });
    });

    test('API tests', async () => {
      console.log('Creating new API tests');
      const testAttempt = test.info().retry + 1;
      let api: API;
      await test.step('Create API', async () => {
        console.log('Creating new API');
        api = new API(page.page);
        await api.init();
        await api.add("TestAPI" + testAttempt, "/testAdd" + testAttempt);
      });
      await test.step('Open Diagram View of API', async () => {
        console.log('Opening Diagram View of API');
        await api.openDiagramView('TestAPI');
      });
      await test.step('Edit API', async () => {
        console.log('Editing API');
        await api.edit("NewTestAPI" + testAttempt, "/newtest" + testAttempt);
      });

      await test.step('Add Resource', async () => {
        console.log('Adding new Resource');
        await api.addResource("/testResource" + testAttempt);
      });
      await test.step('Edit Resource', async () => {
        console.log('Editing Resource');
        await api.editResource();
      });
      await test.step('Delete Resource', async () => {
        console.log('Deleting Resource');
        await api.deleteResource();
      });
      await test.step('Delete API', async () => {
        console.log('Deleting API');
        await api.delete();
      });

      await test.step('Create WSDL from file', async () => {
        console.log('Creating new API from WSDL file');
        await api.createWSDLFromFile("NewFileWSDLAPI" + testAttempt, "/wsdlAPIFile" + testAttempt);
      });
      await test.step('Create WSDL from URL', async () => {
        console.log('Creating new API from WSDL URL');
        await api.createWSDLFromSidePanel("NewUrlWSDLAPI" + testAttempt, "/wsdlAPI" + testAttempt);
      });
      await test.step('Create Open API from OpenAPI file', async () => {
        console.log('Creating new API from OpenAPI file');
        await api.createOpenApi("NewOpenAPI" + testAttempt, "/openAPI" + testAttempt);
      });
    });

    test('Endpoint tests', async () => {
      let lb: Endpoint;
      const testAttempt = test.info().retry + 1;
      await test.step('Add http Endpoint', async () => {
        console.log('Creating new http Endpoint');
        lb = new Endpoint(page.page);
        await lb.init();
        await lb.addHttpEndpoint("httpEP" + testAttempt);
      });
      await test.step('Edit http Endpoint', async () => {
        console.log('Editing http Endpoint');
        await lb.editHttpEndpoint("httpEP" + testAttempt, "newHttpEP" + testAttempt);
      });
      await test.step('Add load balance Endpoint', async () => {
        console.log('Creating new load balance Endpoint');
        await lb.addLoadBalanceEndpoint("loadBalanceEP" + testAttempt);
      });
      await test.step('Edit load balance Endpoint', async () => {
        console.log('Editing load balance Endpoint');
        await lb.editLoadBalanceEndpoint("loadBalanceEP" + testAttempt, "loadBalanceEndpoint" + testAttempt);
      });
    });

    test('Sequence tests', async () => {
      let sequence: Sequence;
      const testAttempt = test.info().retry + 1;
      await test.step('Add Sequence', async () => {
        console.log('Creating new Sequence');
        sequence = new Sequence(page.page);
        await sequence.init();
        await sequence.add("seqEP" + testAttempt);
      });
      await test.step('Edit Sequence', async () => {
        console.log('Editing Sequence');
        await sequence.edit("seqEP" + testAttempt, "newSeqEP" + testAttempt, currentTaskName);
      });
    });

    test('Event Integration tests ', async () => {
      let eventIntegration: EventIntegration;
      let name: string = "HttpEventIntegration";
      await test.step('Add Event Integration', async () => {
        console.log('Creating new Event Integration');
        eventIntegration = new EventIntegration(page.page);
        await eventIntegration.init();
        await eventIntegration.add(name);
      });

      await test.step('Edit Event Integration', async () => {
        console.log('Editing Event Integration');
        await eventIntegration.edit(name);
      });

      await test.step('Open Diagram View of Event Integration', async () => {
        console.log('Opening Diagram View');
        await eventIntegration.openDiagramView(name);
      });
    });

    test('Add Class Mediator', async () => {
      const testAttempt = test.info().retry + 1;
      console.log('Creating new Class Mediator');
      const classMediator = new ClassMediator(page.page);
      await classMediator.init();
      await classMediator.add("org.wso2.sample" + testAttempt);
    });

    test('Add Ballerina Module', async () => {
      const testAttempt = test.info().retry + 1;
      console.log('Creating new Ballerina Module');
      const ballerinaModule = new BallerinaModule(page.page);
      await ballerinaModule.init();
      await ballerinaModule.add("testBal" + testAttempt);
    });

    test('Add Resource', async () => {
      const testAttempt = test.info().retry + 1;
      console.log('Creating new Resource');
      const resource = new Resource(page.page);
      await resource.init();
      await resource.add("testResource" + testAttempt);
    });

    test('Data related tests', async () => {
      const testAttempt = test.info().retry + 1;
      let ms: MessageStore;
      await test.step('Add Message Store', async () => {
        console.log('Creating new Message Store');
        ms = new MessageStore(page.page);
        await ms.init();
        await ms.addInMemmoryMS("msgStore" + testAttempt);
      });
      await test.step('Edit Message Store', async () => {
        console.log('Editing Message Store');
        await ms.editInMemoryMS("msgStore" + testAttempt, "newMsgStore" + testAttempt);
      });

      let dataSource: DataSource;
      await test.step('Add Data Source', async () => {
        console.log('Creating new Data Source');
        dataSource = new DataSource(page.page);
        await dataSource.init();
        await dataSource.add("testDataSource" + testAttempt);
      });
      await test.step('Edit Data Source', async () => {
        console.log('Editing Data Source');
        await dataSource.edit("testDataSource" + testAttempt, "newTestDataSource" + testAttempt);
      });

      await test.step('Add Data Service', async () => {
        console.log('Creating new Data Service');
        const dataService = new DataService(page.page);
        await dataService.init();
        await dataService.add("testDataService" + testAttempt);
      });
      await test.step('Edit Data Service', async () => {
        console.log('Editing Data Service');
        const dataService = new DataService(page.page);
        await dataService.edit("testDataService" + testAttempt, "newTestDataService" + testAttempt);
      });
    });

    test('Message Processor Tests', async () => {
      let msp: MessageProcessor;
      const testAttempt = test.info().retry + 1;
      await test.step('Message Sampling Processor Tests', async () => {
        const mpName = "TestMessageSamplingProcessor" + testAttempt;
        const mpUpdatedName = "TestMessageSamplingProcessor" + testAttempt + "Edited";
        msp = new MessageProcessor(page.page);
        console.log('Create Message Sampling Processor');
        await msp.createMessageSamplingProcessor(mpName);
        console.log('Edit Message Sampling Processor');
        await msp.editMessageSamplingProcessor(mpName, mpUpdatedName);
      });
      await test.step('Scheduled Message Forwarding Processor Tests', async () => {
        const mpName = "TestScheduledMessageForwardingProcessor" + testAttempt;
        const mpUpdatedName = "TestScheduledMessageForwardingProcessor" + testAttempt + "Edited";
        msp = new MessageProcessor(page.page);
        console.log('Create Message Forwarding Processor');
        await msp.createScheduledMessageForwardingProcessor(mpName);
        console.log('Edit Message Forwarding Processor');
        await msp.editScheduledMessageForwardingProcessor(mpName, mpUpdatedName);
      });
      await test.step('Scheduled Failover Message Forwarding Processor Tests', async () => {
        const mpName = "TestScheduledFailoverMessageForwardingProcessor" + testAttempt;
        const mpUpdatedName = "TestScheduledFailoverMessageForwardingProcessor" + testAttempt + "Edited";
        msp = new MessageProcessor(page.page);
        console.log('Create Scheduled Failover Message Forwarding Processor');
        await msp.createScheduledFailoverMessageForwardingProcessor(mpName);
        console.log('Edit Failover Message Forwarding Processor');
        await msp.editScheduledFailoverMessageForwardingProcessor(mpName, mpUpdatedName);
      });
      await test.step('Custom Message Processor Tests', async () => {
        const mpName = "TestCustomMessageProcessor" + testAttempt;
        const mpUpdatedName = "TestCustomMessageProcessor" + testAttempt + "Edited";
        msp = new MessageProcessor(page.page);
        console.log('Create Custom Message Processor');
        await msp.createCustomMessageProcessor(mpName);
        console.log('Edit Custom Message Processor');
        await msp.editCustomMessageProcessor(mpName, mpUpdatedName);
      });
      await test.step('Create Message Processor from Project Explorer', async () => {
        const testAttempt = test.info().retry + 1;
        const mpName = "TestMessageProcessor" + testAttempt;
        console.log('Create Message Processor from Project Explorer');
        msp = new MessageProcessor(page.page);
        await msp.createMessageProcessorFromProjectExplorer(mpName);
      });
    });

    test('Local Entry tests', async () => {
      const testAttempt = test.info().retry + 1;
      let localEntry: LocalEntry;
      await test.step('Add Local Entry', async () => {
        console.log('Creating new Local Entry');
        localEntry = new LocalEntry(page.page);
        await localEntry.init();
        await localEntry.addLocalEntry("localEntry" + testAttempt);
      });
      await test.step('Edit Local Entry', async () => {
        console.log('Editing Local Entry');
        await localEntry.editLocalEntry("localEntry" + testAttempt, "newLocalEntry" + testAttempt);
      });
    });

    test('Template tests', async () => {
      const testAttempt = test.info().retry + 1;
      let template: Template;
      await test.step('Add Template', async () => {
        console.log('Creating new Template');
        template = new Template(page.page);
        await template.init();
        await template.addTemplate("tempEP" + testAttempt);
      });
      await test.step('Edit Template', async () => {
        console.log('Editing Template');
        await template.editTemplate("tempEP" + testAttempt, "newTempEP" + testAttempt);
      });
    });

    test('Proxy tests', async () => {
      const testAttempt = test.info().retry + 1;
      let proxyService: Proxy;
      await test.step('Add Proxy Service', async () => {
        console.log('Creating new Proxy Service');
        proxyService = new Proxy(page.page);
        await proxyService.init();
        await proxyService.add("testProxyService" + testAttempt);
      });
      await test.step('Edit Proxy Service', async () => {
        console.log('Editing Proxy Service');
        await proxyService.edit("testProxyService" + testAttempt, "newTestProxyService" + testAttempt);
      });
    });
      
    test ('Import Artifact', async () => {
      await test.step('Import API Artifact', async () => {
        const importArtifact = new ImportArtifact(page.page);
        await importArtifact.init();
        await importArtifact.import(filePath);
        const api = new API(page.page);
        await api.openDiagramView('importApi', true);
      });
    });
  });
}
