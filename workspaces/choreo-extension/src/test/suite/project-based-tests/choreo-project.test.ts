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

import sinon = require("sinon");
import assert = require("assert");
import { commands, Uri, extensions } from "vscode";
import { suite, suiteSetup } from "mocha";
import { join } from "path";
import { Component } from "@wso2-enterprise/choreo-core";
import { ChoreoAuthClient, ChoreoOrgClient, ChoreoProjectClient, KeyChainTokenStorage } from "@wso2-enterprise/choreo-client";
import { ChoreoProjectManager } from "@wso2-enterprise/choreo-client/lib/manager";
import { MockAuthClient, MockKeyChainTokenStorage, MockOrgClient, MockProjectClient } from "../mocked-resources/mocked-clients";
import { ext } from "../../../extensionVariables";
import { showChoreoProjectOverview } from "../../../extension";
import { activateStatusBarItem } from "../../../status-bar";
import { FOO_ORG, FOO_P1_COMPONENT, FOO_PROJECT_1 } from "../mocked-resources/mocked-data";
import { ProjectRegistry } from "../../../registry/project-registry";

export const TEST_PROJECT_NAME: string = 'FooProject1';
const projectRoot = join(__dirname, '..', '..', '..', '..', 'src', 'test', 'data', TEST_PROJECT_NAME);
const uri = Uri.file(join(projectRoot, `${TEST_PROJECT_NAME}.code-workspace`));
const OPEN_FOLDER_CMD: string = 'vscode.openFolder';

suite('Choreo Project Based Tests', () => {
    suiteSetup('Setup project workspace', async () => {
        const authClient = new MockAuthClient();
        sinon.stub(ChoreoAuthClient.prototype, 'exchangeApimToken').callsFake(async (params) => await authClient.exchangeApimToken(params[0], params[1]));
        sinon.stub(ChoreoAuthClient.prototype, 'exchangeVSCodeToken').callsFake(async (params) => await authClient.exchangeVSCodeToken(params[0]));

        const tokenStorage = new MockKeyChainTokenStorage();
        sinon.stub(KeyChainTokenStorage.prototype, 'getToken').resolves(await tokenStorage.getToken("choreo.token"));

        const orgClient = new MockOrgClient();
        sinon.stub(ChoreoOrgClient.prototype, 'getUserInfo').resolves(await orgClient.getUserInfo());

        const projectClient = new MockProjectClient();
        sinon.stub(ChoreoProjectClient.prototype, 'getProjects').callsFake(async (params) => await projectClient.getProjects(params));
        sinon.stub(ChoreoProjectClient.prototype, 'getComponents').callsFake(async (params) => await projectClient.getComponents(params));
    });

    test('Check isChoreoProject', async () => {
        commands.executeCommand(OPEN_FOLDER_CMD, uri).then(async () => {
            assert.ok(await ext.api.isChoreoProject(), 'Did not detect workspace as a Choreo project.');
        });
    });

    test('Check Active Project on Status Bar', async () => {
        await activateStatusBarItem();
        assert.strictEqual(ext.statusBarItem.text, `Choreo: ${FOO_PROJECT_1.name}`);
    });

    test('Generate Project Overview', async () => {
        await showChoreoProjectOverview().then(async () => {
            assert.strictEqual(ext.api.selectedOrg, FOO_ORG);
            // assert.strictEqual(ext.api.selectedProjectId, FOO_PROJECT_1.id);

            const actualComponents: Component[] = await ProjectRegistry.getInstance().getComponents(FOO_PROJECT_1.id, FOO_ORG.handle);
            const localComponents: Component[] = new ChoreoProjectManager().getLocalComponents(uri.fsPath);
            const expectedComponents: Component[] = [FOO_P1_COMPONENT].concat(localComponents);
            assert.deepEqual(actualComponents, expectedComponents, 'Failed to detect FooProject1 components.');
        });
    });

    test('Generate Architecture View', async () => {
        const ext = extensions.getExtension('wso2.ballerina');
        if (!ext) {
            assert.fail('Did not detect the Ballerina extension.');
        } else {
            if (ext && !ext.isActive) {
                await ext.activate();
            }
            await commands.executeCommand('ballerina.view.architectureView').then(() => {
                assert.ok(true);
            });
        }
    }).timeout(7500);
}).timeout(15000);
