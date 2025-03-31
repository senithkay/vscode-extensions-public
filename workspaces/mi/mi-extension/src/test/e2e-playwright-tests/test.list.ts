/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { test } from '@playwright/test';
import connectionTests from './connectionTests/connection.spec';
import inboundEpTests from './connectionTests/inboundEndpoint.spec';
import artifactTests from './artifactTests/artifact.spec';
import { page } from './Utils';
const fs = require('fs');
const path = require('path');

test.beforeAll(async () => {
    const videosFolder = path.join(__dirname, '..', 'test-resources', 'videos');

    if (fs.existsSync(videosFolder)) {
        fs.rmSync(videosFolder, { recursive: true, force: true });
    }
    console.log('>>> Starting tests');
});

test.describe(connectionTests);
test.describe(inboundEpTests);
test.describe(artifactTests);

test.afterAll(async () => {
    console.log(`>>> Finished all tests`);
    await page.page?.close();
});
