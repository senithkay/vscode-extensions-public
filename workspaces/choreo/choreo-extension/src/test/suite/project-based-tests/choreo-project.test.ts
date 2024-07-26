/*
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import sinon = require("sinon");
import assert = require("assert");
import { commands, Uri } from "vscode";
import { suite, suiteSetup, suiteTeardown } from "mocha";
import { join } from "path";
import { ChoreoAuthClient, ChoreoProjectClient } from "@wso2-enterprise/choreo-client";
import { MockAuthClient, MockKeyChainTokenStorage, MockOrgClient, MockProjectClient } from "../mocked-resources/mocked-clients";
import { ext } from "../../../extensionVariables";
import { activateStatusBarItem } from "../../../status-bar";
import { FOO_PROJECT_1 } from "../mocked-resources/mocked-data";
import { TokenStorage } from "../../../auth/TokenStorage";

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
        keyChainGetTokenStub = sinon.stub(TokenStorage.prototype, 'getToken').callsFake(async (params: any) =>
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

    suiteTeardown(() => {
        vscodeTokenStub.restore();
        keyChainGetTokenStub.restore();
        getUserInfoStub.restore();
        getProjectsStub.restore();
        getComponentsStub.restore();
    });
});
