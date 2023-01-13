/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 * 
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
 */
import * as assert from 'assert';
import { suite, setup, test } from 'mocha';
import * as vscode from 'vscode';
import { ProjectRegistry } from '../../registry/project-registry';

suite('Project Registry', function () {
    let projectRegistry: ProjectRegistry;

    setup(function () {
        projectRegistry = ProjectRegistry.getInstance();
    });

    suite('create project registry', function () {
        test('should return -1 when not present', function () {
            assert.equal(-1, [1, 2, 3].indexOf(4));
        });
    });

});

