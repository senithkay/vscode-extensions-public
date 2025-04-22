/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { test, expect } from '@playwright/test';
import { Form } from './../components/Form';
import { AddArtifact } from './../components/AddArtifact';
import { ServiceDesigner } from './../components/ServiceDesigner';
import { initTest, page } from '../Utils';
import { Diagram, SidePanel } from './../components/Diagram';
import { MACHINE_VIEW } from '@wso2-enterprise/mi-core';
import { Overview } from '../components/Overview';
import { Sequence } from '../components/ArtifactTest/Sequence';

export default function createTests() {
  test.describe("Cache Mediator Tests", {
    tag: '@group2',
  }, async () => {
    initTest();

    test("Cache Mediator Tests", async ({ }, testInfo) => {
      const testAttempt = testInfo.retry + 1;
      await test.step('Create new API for Cache Mediator', async () => {
        // wait until window reload
        const { title: iframeTitle } = await page.getCurrentWebview();

        if (iframeTitle === MACHINE_VIEW.Overview) {
          const overviewPage = new Overview(page.page);
          await overviewPage.init();
          await overviewPage.goToAddArtifact();
        }

        const addArtifactPage = new AddArtifact(page.page);
        await addArtifactPage.init();
        await addArtifactPage.add('API');

        const apiForm = new Form(page.page, 'API Form');
        await apiForm.switchToFormView();
        await apiForm.fill({
          values: {
            'Name*': {
              type: 'input',
              value: 'cacheMediatorAPI' + testAttempt,
            },
            'Context*': {
              type: 'input',
              value: '/cacheMediatorAPI' + testAttempt,
            },
          }
        });
        await apiForm.submit();
      });

      await test.step('Service designer', async () => {
        // service designer
        const serviceDesigner = new ServiceDesigner(page.page);
        await serviceDesigner.init();
        const resource = await serviceDesigner.resource('GET', '/');
        await resource.click();
      });

      await test.step('Add cache mediator in to resource with default values', async () => {
        const diagram = new Diagram(page.page, 'Resource');
        await diagram.init();
        await diagram.addMediator('Cache');
        await diagram.getMediator('cache', 0, 'group');
      });

      await test.step('Add add mediators to inner sequence in cache mediator', async () => {
        const diagram = new Diagram(page.page, 'Resource');
        await diagram.init();
        await diagram.addMediator('Log', { values: {} }, 1)
        await diagram.getMediator('log');
      });

      await test.step('Delete cache mediator', async () => {
        const diagram = new Diagram(page.page, 'Resource');
        await diagram.init();
        const mediator = await diagram.getMediator('cache', 0, 'group');
        await mediator.delete();
        const cacheMediatorsCount = await diagram.getMediatorsCount('cache', 'group');
        expect(cacheMediatorsCount).toBe(0);
      });

      await test.step('Add cache mediator in to resource with custom values', async () => {
        const diagram = new Diagram(page.page, 'Resource');
        await diagram.init();
        await diagram.addMediator('Cache', {
          values: {
            'Cache Mediator Implementation': {
              type: 'combo',
              value: 'Default',
            },
            'Cache Type': {
              type: 'combo',
              value: 'FINDER',
            },
            'Cache Timeout(S)': {
              type: 'input',
              value: '240',
            },
            'Max Message Size(bytes)': {
              type: 'input',
              value: '4000',
            },
            'Max Entry Count*': {
              type: 'input',
              value: '2000',
            },
            'Sequence Type': {
              type: 'combo',
              value: 'ANONYMOUS',
            },
            'Cache Protocol Type': {
              type: 'combo',
              value: 'HTTP',
            },
            'Cache Protocol Methods': {
              type: 'input',
              value: '400',
            },
            'Headers To Exclude In Hash': {
              type: 'input',
              value: 'application/xml',
            },
            'Headers To Include In Hash': {
              type: 'input',
              value: 'application/json',
            },
            'Response Codes': {
              type: 'input',
              value: '303',
            },
            'Enable Cache Control': {
              type: 'checkbox',
              value: 'checked',
            },
            'Include Age Header': {
              type: 'checkbox',
              value: 'checked',
            },
            'Hash Generator': {
              type: 'input',
              value: 'org.wso2.carbon.mediator.cache.digest.HttpRequestHashGenerator',
            },
            'Description': {
              type: 'input',
              value: 'cache mediator',
            },
          }
        });
        await diagram.getMediator('cache', 0, 'group');
      });

      await test.step('Edit cache mediator in resource', async () => {
        const diagram = new Diagram(page.page, 'Resource');
        await diagram.init();
        const mediator = await diagram.getMediator('cache', 0, 'group');
        await mediator.edit({
          values: {
            'Cache Mediator Implementation': {
              type: 'combo',
              value: '611 Compatible',
            },
            'Id': {
              type: 'input',
              value: 'id1',
            },
            'Description': {
              type: 'input',
              value: 'cache mediator edited',
            },
          }
        });
        await diagram.getMediator('cache', 0, 'group');
      });

      await test.step('Enable sequence key field', async () => {
        const diagram = new Diagram(page.page, 'Resource');
        await diagram.init();
        await diagram.addMediator('Cache', {
          values: {
            'Sequence Type': {
              type: 'combo',
              value: 'REGISTRY_REFERENCE',
            },
          },
          enabledFields: ['Sequence Key']
        });
        await diagram.getMediator('cache', 0, 'group');
      });

      await test.step('Navigate to new sequence creating page when adding new cache mediator', async () => {
        const diagram = new Diagram(page.page, 'Resource');
        await diagram.init();
        await diagram.clickPlusButtonByIndex(0);
        const sidePanel = new SidePanel(diagram.getDiagramWebView());
        await sidePanel.init();
        await sidePanel.search('Cache');
        await sidePanel.selectMediator('Cache');
        const form = await sidePanel.getForm();
        await form.fill({
          values: {
            'Sequence Type': {
              type: 'combo',
              value: 'REGISTRY_REFERENCE',
            }
          },
          enabledFields: ['Sequence Key']
        });
        await form.clickAddNewForField('Sequence Key');
        const sequence = new Sequence(page.page);
        await sequence.createSequence('cacheSeq1', true);
        await form.submit("Add");
        await diagram.getMediator("cache", 0, "group");
      });

      await test.step('Add cache mediator by selecting already created sequence', async () => {
        const diagram = new Diagram(page.page, 'Resource');
        await diagram.init();
        await diagram.addMediator('Cache', {
          values: {
            'Sequence Type': {
              type: 'combo',
              value: 'REGISTRY_REFERENCE',
            },
            'Sequence Key': {
              type: 'combo',
              value: 'cacheSeq1',
            }
          }
        });
        await diagram.getMediator("cache", 1, "group");
      });

      await test.step('Navigate to new sequence creating page when editing cache mediator', async () => {
        const diagram = new Diagram(page.page, 'Resource');
        await diagram.init();
        const mediator = await diagram.getMediator("cache", 0, "group");
        await mediator.click();
        const form = await mediator.getEditForm()
        await form.fill({
          values: {
            'Sequence Type': {
              type: 'combo',
              value: 'REGISTRY_REFERENCE',
            }
          },
          enabledFields: ['Sequence Key']
        });
        await form.clickAddNewForField('Sequence Key');
        const sequence = new Sequence(page.page);
        await sequence.createSequence('cacheSeq2', true);
        await form.submit("Update");
        await diagram.getMediator("cache", 0, "group");
      });
    });
  });
}
