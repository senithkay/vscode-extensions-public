import { ChoreoProjectManager } from "@wso2-enterprise/choreo-client/lib/manager";
import { RPCInterface } from "./rpc-types";
import { ExtensionContext, Location, OpenDialogOptions, commands, window, workspace } from "vscode";
import { BallerinaProjectComponents, ExtendedLangClient } from "../../core";
import { Project } from "@wso2-enterprise/choreo-core";

const directoryPickOptions: OpenDialogOptions = {
    canSelectMany: false,
    openLabel: 'Select',
    canSelectFiles: false,
    canSelectFolders: true
};

export class RPCManger implements RPCInterface {

    private _langClient: ExtendedLangClient;

    constructor(langClient: ExtendedLangClient) {
        this._langClient = langClient;
    }


    getComponents(): Promise<BallerinaProjectComponents> {
        // Check if there is at least one workspace folder
        if (workspace.workspaceFolders?.length) {
            const workspaceFolder = workspace.workspaceFolders[0];
            const workspaceUri = workspaceFolder.uri;

            return this._langClient.getBallerinaProjectComponents({
                documentIdentifiers: [
                    {
                        uri: workspaceUri.toString(),
                    }
                ]
            });
        } else {
            // Handle the case where there are no workspace folders
            throw new Error("No workspace folders are open");
        }
    }

}