/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import * as assert from 'assert';
import { suite, setup, test } from 'mocha';
import * as vscode from 'vscode';

import { mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { ProjectRegistry } from '../../registry/project-registry';

function createTempDir(): string {
    const tmpDir = tmpdir();
    const randomName = Math.random().toString(36).substring(2, 15);
    const tempDir = join(tmpDir, randomName);
    mkdirSync(tempDir);
    return tempDir;
}

suite('Project Registry', function () {
    let projectRegistry: ProjectRegistry;

    setup(function () {
        projectRegistry = ProjectRegistry.getInstance();
    });

    suite('location ', function () {
        test('set and get', function () {
            // need to use existing location as the project registry will not create the location
            // unless it is actually there 
            const location = createTempDir();
            projectRegistry.setProjectLocation('project-id', location);
            const path = projectRegistry.getProjectLocation('project-id');
            assert.equal(path, location);
            rmSync(location, { recursive: true });
        });

    });

});

