/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { expect, test } from '@playwright/test';
import { Form } from '../components/Form';
import { AddArtifact } from '../components/AddArtifact';
import { clearNotificationAlerts, initTest, page } from '../Utils';
import { InboundEPForm } from '../components/InboundEp';
import { Diagram } from '../components/Diagram';
import { Overview } from '../components/Overview';

export default function createTests() {
    initTest("inboundEndpoint");

    test('Create new HTTPS inbound endpoint', async () => {
        // Create HTTPS inbound endpoint with automatically generated sequences
        const overviewPage = new Overview(page.page);
        await overviewPage.init();
        await overviewPage.goToAddArtifact();

        const addArtifactPage = new AddArtifact(page.page);
        await addArtifactPage.init();
        await addArtifactPage.add('Event Integration');

        const inboundEPSelector = new InboundEPForm(page.page);
        await inboundEPSelector.init();
        await inboundEPSelector.selectType('HTTPS');

        const inboundEPForm = new Form(page.page, 'Event Integration Form');
        await inboundEPForm.switchToFormView();
        await inboundEPForm.fill({
            values: {
                'Event Integration Name*': {
                    type: 'input',
                    value: 'HTTPS_inboundEP',
                },
                'Port*': {
                    type: 'input',
                    value: '8080',
                }
            }
        });
        await clearNotificationAlerts(page);
        await inboundEPForm.submit('Create');

        const diagram = new Diagram(page.page, 'Event Integration');
        await diagram.init();
        await diagram.addMediator('Log');
        const diagramTitle = diagram.getDiagramTitle();

        expect(await diagramTitle).toBe('Event Integration: HTTPS_inboundEP');
    });

    test('Edit Inbound Endpoint', async () => {
        // Edit Inbound Endpoint

        const diagram = new Diagram(page.page, 'Event Integration');
        await diagram.init();
        await diagram.edit();

        const inboundEPForm = new Form(page.page, 'Event Integration Form');
        await inboundEPForm.switchToFormView();
        await inboundEPForm.fill({
            values: {
                'Event Integration Name*': {
                    type: 'input',
                    value: 'HTTPS_inboundEP2',
                },
                'Port*': {
                    type: 'input',
                    value: '9090',
                }
            }
        });

        await inboundEPForm.submit('Update');

        await diagram.init();
        const diagramTitle = diagram.getDiagramTitle();
        expect(await diagramTitle).toBe('Event Integration: HTTPS_inboundEP2');
    });
}
