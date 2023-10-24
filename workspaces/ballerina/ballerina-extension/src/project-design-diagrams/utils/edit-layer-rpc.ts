/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { ChoreoProjectManager } from "@wso2-enterprise/choreo-client/lib/manager";
import { BallerinaComponentCreationParams, ChoreoComponentCreationParams } from "@wso2-enterprise/choreo-core";
import {
    BallerinaTriggerResponse, BallerinaTriggersResponse, CMLocation as Location, CMAnnotation as Annotation
} from "@wso2-enterprise/ballerina-languageclient";
import { Messenger } from "vscode-messenger";
import { commands, ExtensionContext, OpenDialogOptions, WebviewPanel, window, workspace } from "vscode";
import { NodePosition } from "@wso2-enterprise/syntax-tree";
import {
    AddConnectorArgs, AddLinkArgs, DIAGNOSTICS_WARNING, DeleteLinkArgs, GLOBAL_STATE_FLAG, MULTI_ROOT_WORKSPACE_PROMPT
} from "../resources";
import { ExtendedLangClient } from "../../core";
import { BallerinaConnectorsResponse, BallerinaConnectorsRequest } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { PALETTE_COMMANDS } from "../../project/cmds/cmd-runner";
import { deleteLink, editDisplayLabel } from "./component-utils";
import { addConnector, linkServices, pullConnector } from "./linking-utils";
import { BallerinaProjectManager } from "./project-utils/manager";
import { go2source } from "./shared-utils";
import { disposeDiagramWebview } from "../activator";

const directoryPickOptions: OpenDialogOptions = {
    canSelectMany: false,
    openLabel: 'Select',
    canSelectFiles: false,
    canSelectFolders: true
};

export class EditLayerRPC {
    private _messenger: Messenger;
    private _projectManager: ChoreoProjectManager | BallerinaProjectManager;

    constructor(messengerX: Messenger, webview: WebviewPanel, langClient: ExtendedLangClient, context: ExtensionContext, isChoreoProject: boolean) {
        this._messenger = messengerX;
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

        this._messenger.onRequest({ method: 'addConnector' }, (args: AddConnectorArgs): Promise<boolean> => {
            return addConnector(langClient, args);
        });

        this._messenger.onRequest({ method: 'pullConnector' }, (args: AddConnectorArgs): Promise<boolean> => {
            return pullConnector(langClient, args);
        });

        this._messenger.onRequest({ method: 'addLink' }, (args: AddLinkArgs): Promise<boolean> => {
            return linkServices(langClient, args);
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
        });

        this._messenger.onNotification({ method: 'promptWorkspaceConversion' }, (): void => {
            const saveAction = 'Save As Workspace';
            window.showInformationMessage(MULTI_ROOT_WORKSPACE_PROMPT, saveAction).then(async (selection) => {
                if (saveAction === selection) {
                    disposeDiagramWebview();
                    context.globalState.update(GLOBAL_STATE_FLAG, true);
                    commands.executeCommand('workbench.action.saveWorkspaceAs');
                }
            });
        });
    }

    static create(messengerX, webview: WebviewPanel, langClient: ExtendedLangClient, context: ExtensionContext, isChoreoProject: boolean) {
        return new EditLayerRPC(messengerX, webview, langClient, context, isChoreoProject);
    }
}
