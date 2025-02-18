/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import * as path from 'path';
import { generateBallerinaCode } from '../../../src/rpc-managers/ai-panel/utils';
import * as assert from 'assert';
import * as fs from 'fs';

const RESOURCES_PATH = path.resolve(__dirname, '../../../../test/ai/datamapper/resources');

suite.only("AI Datamapper tests suite", () => {
    setup(done => {
        done();
    });

    const testFolders = fs.readdirSync(RESOURCES_PATH)
        .filter((file) => fs.lstatSync(path.join(RESOURCES_PATH, file)).isDirectory());

    testFolders.forEach((folder) => {
        test(`Datamapper Tests : ${folder}`, async () => {
            const mapping = JSON.parse(fs.readFileSync(path.join(RESOURCES_PATH, folder, 'mapping.json'), 'utf8'));
            const paramDef = JSON.parse(fs.readFileSync(path.join(RESOURCES_PATH, folder, 'param_def.json'), 'utf8'));
            const expected = JSON.parse(fs.readFileSync(path.join(RESOURCES_PATH, folder, 'expected.json'), 'utf8'));
            const resp = await generateBallerinaCode(mapping, paramDef, "");
            assert.deepStrictEqual(resp, expected);
        });
    });
})

