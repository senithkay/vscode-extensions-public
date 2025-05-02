/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { test } from '@playwright/test';
import { page } from './utils';
const fs = require('fs');
const path = require('path');
const videosFolder = path.join(__dirname, '..', 'test-resources', 'videos');

import service from './service/service.spec';
import automation from './automation/automation.spec';

test.describe.configure({ mode: 'default' });

test.beforeAll(async () => {
    if (fs.existsSync(videosFolder)) {
        fs.rmSync(videosFolder, { recursive: true, force: true });
    }
    console.log('>>> Starting test suite');
});

test.describe(service);
test.describe(automation);

test.afterAll(async () => {
    console.log(`>>> Finished test suite`);
    const dateTime = new Date().toISOString().replace(/:/g, '-');
    page.page.video()?.saveAs(path.join(videosFolder, `test_${dateTime}.webm`));
    await page.page?.close();
});
