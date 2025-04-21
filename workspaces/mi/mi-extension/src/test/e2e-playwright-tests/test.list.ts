/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { test } from '@playwright/test';
import connectionTests from './connectorTests/connection.spec';
import connectorTests from './connectorTests/connector.spec';
import inboundEpTests from './connectorTests/inboundEndpoint.spec';
import artifactTests from './artifactTests/artifact.spec';
import createProjectTests from './projectTests/createProject.spec';
import artifact430Tests from './artifactTests/artifact430.spec';
import logMediatorTests from './mediatorTests/log.spec';
import cacheMediatorTests from './mediatorTests/cache.spec';
import overviewPageTests from './OverviewPageTests/projectSettingPage.spec';
import { page } from './Utils';
const fs = require('fs');
const path = require('path');
const videosFolder = path.join(__dirname, '..', 'test-resources', 'videos');

test.describe.configure({ mode: 'default' });

test.beforeAll(async () => {
    if (fs.existsSync(videosFolder)) {
        fs.rmSync(videosFolder, { recursive: true, force: true });
    }
    console.log('>>> Starting test suite');
});

test.describe(createProjectTests);
test.describe(artifactTests);
test.describe(overviewPageTests);
test.describe(connectionTests);
test.describe(connectorTests);
test.describe(inboundEpTests);
test.describe(logMediatorTests);
test.describe(cacheMediatorTests);
test.describe(artifact430Tests);

test.afterAll(async () => {
    console.log(`>>> Finished test suite`);
    const dateTime = new Date().toISOString().replace(/:/g, '-');
    page.page.video()?.saveAs(path.join(videosFolder, `test_${dateTime}.webm`));
    await page.page?.close();
});
