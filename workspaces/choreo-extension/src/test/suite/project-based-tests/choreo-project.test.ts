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
import { suite, suiteSetup, suiteTeardown } from "mocha";
import { join } from "path";
import { Component } from "@wso2-enterprise/choreo-core";
import { ChoreoAuthClient, ChoreoProjectClient, KeyChainTokenStorage } from "@wso2-enterprise/choreo-client";
import { ChoreoProjectManager } from "@wso2-enterprise/choreo-client/lib/manager";
import { MockAuthClient, MockKeyChainTokenStorage, MockOrgClient, MockProjectClient } from "../mocked-resources/mocked-clients";
import { ext } from "../../../extensionVariables";
import { showChoreoProjectOverview } from "../../../extension";
import { activateStatusBarItem } from "../../../status-bar";
import { FOO_ORG, FOO_P1_COMPONENT, FOO_PROJECT_1 } from "../mocked-resources/mocked-data";
import { ProjectRegistry } from "../../../registry/project-registry";

export const TEST_PROJECT_NAME: string = 'FooProject1';
const projectRoot = join(__dirname, '..', '..', '..', '..', 'src', 'test', 'data', TEST_PROJECT_NAME);
const workspaceFileURI = Uri.file(join(projectRoot, `${TEST_PROJECT_NAME}.code-workspace`));

async function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

suite('Choreo Project Tests', () => {
    let vscodeTokenStub: sinon.SinonStub, keyChainGetTokenStub: sinon.SinonStub,
        getUserInfoStub: sinon.SinonStub, getProjectsStub: sinon.SinonStub, getComponentsStub: sinon.SinonStub;

    suiteSetup('Set up mocked environment', async () => {
        const mockAuthClient = new MockAuthClient();
        vscodeTokenStub = sinon.stub(ChoreoAuthClient.prototype, 'exchangeVSCodeToken').callsFake(async (params) =>
            await mockAuthClient.exchangeVSCodeToken(params[0]));

        const mockTokenStore = new MockKeyChainTokenStorage();
        keyChainGetTokenStub = sinon.stub(KeyChainTokenStorage.prototype, 'getToken').callsFake(async (params) =>
            await mockTokenStore.getToken(params));

        const mockOrgClient = new MockOrgClient();

        const mockProjectClient = new MockProjectClient();
        getProjectsStub = sinon.stub(ChoreoProjectClient.prototype, 'getProjects').callsFake(async (params) =>
            await mockProjectClient.getProjects(params));
        getComponentsStub = sinon.stub(ChoreoProjectClient.prototype, 'getComponents').callsFake(async (params) =>
            await mockProjectClient.getComponents(params));
    });

    test('Check isChoreoProject', async () => {
        await commands.executeCommand('vscode.openFolder', workspaceFileURI);
        assert.strictEqual(await ext.api.isChoreoProject(), true, 'Did not detect workspace as a Choreo project.');
    });

    test('Check Active Project on Status Bar', async () => {
        await activateStatusBarItem();
        sinon.assert.called(getProjectsStub);
        assert.strictEqual(ext.statusBarItem.text, `Choreo: ${FOO_PROJECT_1.name}`);
    });

    test('Generate Project Overview', async () => {
        await showChoreoProjectOverview();
        const actualComponents: Component[] = await ProjectRegistry.getInstance().getComponents(FOO_PROJECT_1.id, FOO_ORG.handle, FOO_ORG.uuid);
        const localComponents: Component[] = new ChoreoProjectManager().getLocalComponents(workspaceFileURI.fsPath);
        const expectedComponents: Component[] = [FOO_P1_COMPONENT].concat(localComponents);
        assert.deepStrictEqual(actualComponents, expectedComponents, 'Failed to detect FooProject1 components.');
        // assert.strictEqual(ext.api.selectedOrg, FOO_ORG, 'Failed to detect correct organization.');

        await wait(1000);
        sinon.assert.called(vscodeTokenStub);
        sinon.assert.called(getUserInfoStub);
        sinon.assert.called(getComponentsStub);
    }).timeout(5000);

    test('Generate Architecture View', async () => {
        const ext = extensions.getExtension('wso2.ballerina');
        if (!ext) {
            assert.fail('Did not detect the Ballerina extension.');
        } else {
            if (ext && !ext.isActive) {
                await ext.activate();
            }
            await commands.executeCommand('ballerina.view.architectureView');
            await wait(3000);
            assert.ok(true);
        }
    }).timeout(7500);

    suiteTeardown(() => {
        vscodeTokenStub.restore();
        keyChainGetTokenStub.restore();
        getUserInfoStub.restore();
        getProjectsStub.restore();
        getComponentsStub.restore();
    });
});
