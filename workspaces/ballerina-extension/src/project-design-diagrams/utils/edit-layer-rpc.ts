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
import { Messenger } from "vscode-messenger";
import { existsSync } from "fs";
import { commands, OpenDialogOptions, Position, Range, Selection, TextEditorRevealType, WebviewPanel, window, workspace } from "vscode";
import { BallerinaProjectManager } from "./manager";
import { Location, Service } from "../resources";
import { ExtendedLangClient } from "../../core";
import { addConnector, linkServices, pullConnector } from "./code-generator";
import { BallerinaConnectorsResponse, BallerinaConnectorsRequest } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { PALETTE_COMMANDS } from "../../project/cmds/cmd-runner";
import { NodePosition } from "@wso2-enterprise/syntax-tree";

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

        this._messenger.onRequest({ method: 'addLinks' }, (args: Service[]): Promise<boolean> => {
            return linkServices(langClient, args[0], args[1]);
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

        this._messenger.onNotification({ method: 'go2source' }, (location: Location): void => {
            if (location && existsSync(location.filePath)) {
                workspace.openTextDocument(location.filePath).then((sourceFile) => {
                    window.showTextDocument(sourceFile, { preview: false }).then((textEditor) => {
                        const startPosition: Position = new Position(location.startPosition.line, location.startPosition.offset);
                        const endPosition: Position = new Position(location.endPosition.line, location.endPosition.offset);
                        const range: Range = new Range(startPosition, endPosition);
                        textEditor.revealRange(range, TextEditorRevealType.InCenter);
                        textEditor.selection = new Selection(range.start, range.start);
                    });
                });
            }
        });

        this._messenger.onNotification({ method: 'goToDesign' }, (args: { filePath: string, position: NodePosition }): void => {
            // workspace.openTextDocument(location.filePath).then((sourceFile) => {
            //     window.showTextDocument(sourceFile, { preview: false }).then((textEditor) => {
            //         const startPosition: Position = new Position(location.startPosition.line, location.startPosition.offset);
            //         const endPosition: Position = new Position(location.endPosition.line, location.endPosition.offset);
            //         const range: Range = new Range(startPosition, endPosition);
            //         textEditor.revealRange(range, TextEditorRevealType.InCenter);
            //         textEditor.selection = new Selection(range.start, range.start);
            //     });
            // });
            commands.executeCommand(PALETTE_COMMANDS.OPEN_IN_DIAGRAM, args.filePath, args.position, true);
        });

        this._messenger.onNotification({ method: 'showErrorMsg' }, (msg: string) => {
            window.showErrorMessage(msg);
        });
    }

    static create(webview: WebviewPanel, langClient: ExtendedLangClient, isChoreoProject: boolean) {
        return new EditLayerRPC(webview, langClient, isChoreoProject);
    }
}
