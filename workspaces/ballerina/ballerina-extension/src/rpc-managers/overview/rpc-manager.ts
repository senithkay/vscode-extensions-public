import { workspace } from "vscode";
import { ProjectOverviewAPI, BallerinaLangClientInterface, BallerinaProjectComponents, ExecutorPositionsResponse, GetBallerinaProjectParams, BallerinaFunctionSTRequest, BallerinaSTModifyResponse, GetBallerinaPackagesParams } from "@wso2-enterprise/ballerina-core";

export class OverviewRPCManger implements ProjectOverviewAPI {

    private _langClient: BallerinaLangClientInterface;

    constructor(langClient: BallerinaLangClientInterface) {
        this._langClient = langClient;
    }

    getBallerinaProjectComponents(args: GetBallerinaPackagesParams): Promise<BallerinaProjectComponents> {
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

    getExecutorPositions: (params: GetBallerinaProjectParams) => Promise<ExecutorPositionsResponse>;

    getSTForFunction: (params: BallerinaFunctionSTRequest) => Promise<BallerinaSTModifyResponse>;

}
