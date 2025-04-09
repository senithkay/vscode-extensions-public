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
import { MACHINE_VIEW } from '@wso2-enterprise/mi-core';
import { Overview } from '../components/Overview';
import { Diagram } from './../components/Diagram';

export default function createTests() {
  test.describe(async () => {
    initTest();

    test("Log Mediator Tests", async ({}, testInfo) => {
      const testAttempt = testInfo.retry + 1;
      await test.step('Create new API', async () => {
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
              value: 'logMediatorAPI' + testAttempt,
            },
            'Context*': {
              type: 'input',
              value: '/logMediatorAPI' + testAttempt,
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

      await test.step('Add log mediator in to resource with default values', async () => {
        const diagram = new Diagram(page.page, 'Resource');
        await diagram.init();
        await diagram.addMediator('Log');
        await diagram.getMediator('log');
      });

      await test.step('Delete log mediator', async () => {
        const diagram = new Diagram(page.page, 'Resource');
        await diagram.init();
        const mediator = await diagram.getMediator('log');
        await mediator.delete();
        const logMediatorsCount = await diagram.getMediatorsCount('log');
        expect(logMediatorsCount).toBe(0);
      });

      await test.step('Add log mediator in to resource with custom values', async () => {
        const diagram = new Diagram(page.page, 'Resource');
        await diagram.init();
        await diagram.addMediator('Log', {
          values: {
            'Log Category': {
              type: 'combo',
              value: 'WARN',
            },
            'Append Message ID': {
              type: 'checkbox',
              value: 'checked',
            },
            'Append Payload': {
              type: 'checkbox',
              value: '',
            },
            'Message': {
              type: 'inlineExpression',
              value: 'test message: ${payload.message}',
            }
          }
        });
        await diagram.getMediator('log');
      });

      await test.step('Edit log mediator in resource', async () => {
        const diagram = new Diagram(page.page, 'Resource');
        await diagram.init();
        const mediator = await diagram.getMediator('log');
        await mediator.edit({
          values: {
            'Log Category': {
              type: 'combo',
              value: 'DEBUG',
            },
            'Message': {
              type: 'inlineExpression',
              value: 'test message edited',
            },
            'Append Message ID': {
              type: 'checkbox',
              value: '',
            },
            'Append Payload': {
              type: 'checkbox',
              value: 'checked',
            },
            'Description': {
              type: 'input',
              value: 'log mediator edited',
            }
          }
        });
        const editedDescription = await mediator.getDescription();
        expect(editedDescription).toBe('log mediator edited');
      });
    });
  });
}
