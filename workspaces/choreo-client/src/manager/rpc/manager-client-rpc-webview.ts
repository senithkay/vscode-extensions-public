import { ChoreoComponentCreationParams, Component, IProjectManager, Project } from "@wso2-enterprise/choreo-core";
import { HOST_EXTENSION } from "vscode-messenger-common";
import { Messenger } from "vscode-messenger-webview";
import { CreateLocalComponentRequest } from "./types";

export class ChoreoProjectManagerRPCWebview implements IProjectManager {
    constructor (private _messenger: Messenger) {

    }
    createLocalComponent(args: ChoreoComponentCreationParams): Promise<string | boolean> {
        return this._messenger.sendRequest(CreateLocalComponentRequest, HOST_EXTENSION, args);
    }
    getProjectDetails(): Promise<Project> {
        throw new Error("Method not implemented.");
    }
    getProjectRoot(): Promise<string | undefined> {
        throw new Error("Method not implemented.");
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getLocalComponents(_workspaceFilePath: string): Component[] {
        throw new Error("Method not implemented.");
    }

}