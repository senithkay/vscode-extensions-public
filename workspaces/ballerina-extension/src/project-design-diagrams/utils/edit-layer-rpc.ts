/**
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the 'License'); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import { ChoreoProjectManager } from "@wso2-enterprise/choreo-client/lib/manager";
import { BallerinaComponentCreationParams, ChoreoComponentCreationParams } from "@wso2-enterprise/choreo-core";
import {
    BallerinaTriggerResponse, BallerinaTriggersResponse, CMLocation as Location, CMService as Service, CMAnnotation as Annotation
} from "@wso2-enterprise/ballerina-languageclient";
import { Messenger } from "vscode-messenger";
import { commands, OpenDialogOptions, WebviewPanel, window, workspace } from "vscode";
import { NodePosition } from "@wso2-enterprise/syntax-tree";
import { BallerinaProjectManager } from "./manager";
import { DIAGNOSTICS_WARNING, DeleteLinkArgs, MULTI_ROOT_WORKSPACE_PROMPT } from "../resources";
import { ExtendedLangClient } from "../../core";
import { addConnector, editDisplayLabel, linkServices, pullConnector } from "./code-generator";
import { BallerinaConnectorsResponse, BallerinaConnectorsRequest } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { PALETTE_COMMANDS } from "../../project/cmds/cmd-runner";
import { deleteLink } from "./component-handler-utils";
import { go2source } from "./common-utils";
import { disposeDiagramWebview } from "../activator";

const directoryPickOptions: OpenDialogOptions = {
    canSelectMany: false,
    openLabel: 'Select',
    canSelectFiles: false,
    canSelectFolders: true
};

export class EditLayerRPC {
    private _messenger: Messenger = new Messenger();
    private _projectManager: ChoreoProjectManager | BallerinaProjectManager;

    constructor(webview: WebviewPanel, langClient: ExtendedLangClient, isChoreoProject: boolean) {
        this._messenger.registerWebviewPanel(webview);
        if (isChoreoProject) {
            this._projectManager = new ChoreoProjectManager();
        } else {
            this._projectManager = new BallerinaProjectManager();
        }

        this._messenger.onRequest({ method: 'createComponent' }, (args: BallerinaComponentCreationParams | ChoreoComponentCreationParams): Promise<string | boolean> => {
            if (this._projectManager instanceof ChoreoProjectManager && 'repositoryInfo' in args) {
                return this._projectManager.createLocalComponent(args);
            } else if (this._projectManager instanceof BallerinaProjectManager && 'directory' in args) {
                return this._projectManager.createLocalComponent(args);
            }
            window.showErrorMessage('Error while creating component.');
        });

        this._messenger.onRequest({ method: 'getProjectDetails' }, (): Promise<unknown> => {
            return this._projectManager.getProjectDetails();
        });

        this._messenger.onRequest({ method: 'getProjectRoot' }, (): Promise<string | undefined> => {
            return this._projectManager.getProjectRoot();
        });

        this._messenger.onRequest({ method: 'getConnectors' }, (args: BallerinaConnectorsRequest[]): Promise<BallerinaConnectorsResponse> => {
            return langClient.getConnectors(args[0]).then(result => {
                if ((result as BallerinaConnectorsResponse).central) {
                    return Promise.resolve(result as BallerinaConnectorsResponse);
                }
                return Promise.resolve({ central: [], error: "Not found" } as BallerinaConnectorsResponse);
            });
        });

        this._messenger.onRequest({ method: 'addConnector' }, (args: any[]): Promise<boolean> => {
            return addConnector(langClient, args[0], args[1]);
        });

        this._messenger.onRequest({ method: 'pullConnector' }, (args: any[]): Promise<boolean> => {
            return pullConnector(langClient, args[0], args[1]);
        });

        this._messenger.onRequest({ method: 'addLink' }, (args: Service[]): Promise<boolean> => {
            return linkServices(langClient, args[0], args[1]);
        });

        this._messenger.onRequest({ method: 'deleteLink' }, (args: DeleteLinkArgs): Promise<void> => {
            return deleteLink(langClient, args);
        });

        this._messenger.onRequest({ method: 'pickDirectory' }, async (): Promise<string | undefined> => {
            const fileUri = await window.showOpenDialog(directoryPickOptions);
            if (fileUri && fileUri[0]) {
                return fileUri[0].fsPath;
            }
        });

        this._messenger.onRequest({ method: 'executeCommand' }, async (cmd: string): Promise<boolean> => {
            return commands.executeCommand(cmd);
        });

        this._messenger.onRequest({ method: 'fetchTriggers' }, async (): Promise<BallerinaTriggersResponse | {}> => {
            return langClient.getTriggers({ query: '' });
        });

        this._messenger.onRequest({ method: 'fetchTrigger' }, async (triggerId: string): Promise<BallerinaTriggerResponse | {}> => {
            return langClient.getTrigger({ id: triggerId });
        });

        this._messenger.onRequest({ method: 'editDisplayLabel' }, async (annotation: Annotation): Promise<boolean> => {
            return editDisplayLabel(langClient, annotation);
        });

        this._messenger.onNotification({ method: 'go2source' }, (location: Location): void => {
            go2source(location);
        });

        this._messenger.onNotification({ method: 'goToDesign' }, (args: { filePath: string, position: NodePosition }): void => {
            commands.executeCommand(PALETTE_COMMANDS.OPEN_IN_DIAGRAM, args.filePath, args.position, true);
        });

        this._messenger.onNotification({ method: 'showDiagnosticsWarning' }, () => {
            const action = 'View Problems';
            window.showInformationMessage(DIAGNOSTICS_WARNING, action).then((selection) => {
                if (action === selection) {
                    commands.executeCommand('workbench.action.problems.focus');
                }
            });
        });

        this._messenger.onNotification({ method: 'showErrorMsg' }, (msg: string) => {
            window.showErrorMessage(msg);
        });

        this._messenger.onRequest({ method: 'checkIsMultiRootWs' }, async (): Promise<boolean> => {
            return workspace.workspaceFile ? true : false;
        })

        this._messenger.onRequest({ method: 'promptWorkspaceConversion' }, (): void => {
            const saveAction = 'Save As Workspace';
            window.showInformationMessage(MULTI_ROOT_WORKSPACE_PROMPT, saveAction).then(async (selection) => {
                if (saveAction === selection) {
                    disposeDiagramWebview();
                    commands.executeCommand('workbench.action.saveWorkspaceAs');
                }
            });
        })
    }

    static create(webview: WebviewPanel, langClient: ExtendedLangClient, isChoreoProject: boolean) {
        return new EditLayerRPC(webview, langClient, isChoreoProject);
    }
}
