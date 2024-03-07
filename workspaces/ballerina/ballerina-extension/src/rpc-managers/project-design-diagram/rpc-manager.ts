/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 * 
 * THIS FILE INCLUDES AUTO GENERATED CODE
 */
import {
    AddConnectorRequest,
    AddConnectorResponse,
    AddLinkRequest,
    AddLinkResponse,
    BallerinaTriggerRequest,
    BallerinaTriggerResponse,
    BallerinaTriggersResponse,
    CellViewResponse,
    ChoreoProjectResponse,
    CommandRequest,
    CommandResponse,
    ComponentModelResponse,
    ConnectorsRequest,
    ConnectorsResponse,
    CreateComponentRequest,
    CreateComponentResponse,
    DeleteComponentRequest,
    DeleteLinkRequest,
    DeleteLinkResponse,
    DirectoryResponse,
    DisplayLabelRequest,
    DisplayLabelResponse,
    ErrorMessageRequest,
    GoToDesignRequest,
    LocationRequest,
    MultiRootWsResponse,
    Project,
    ProjectDesignDiagramAPI,
    ProjectDetailsResponse,
    ProjectRootResponse,
    PullConnectorResponse,
    SelectedNodeResponse,
} from "@wso2-enterprise/ballerina-core";
import { ExtensionContext, OpenDialogOptions, commands, window, workspace } from "vscode";
import { extension } from "../../BalExtensionContext";
import { ExtendedLangClient } from "../../core";
import { PALETTE_COMMANDS } from "../../project";
import { DIAGNOSTICS_WARNING, GLOBAL_STATE_FLAG, MULTI_ROOT_WORKSPACE_PROMPT } from "../../project-design-diagrams/resources";
import { StateMachine, openView } from "../../stateMachine";
import { addConnector, getComponentModel, go2source, linkServices, pullConnector } from "./utils";
import { deleteLink, editDisplayLabel } from "./utils/component-utils";
import { BallerinaProjectManager } from "./utils/project-utils/manager";

const directoryPickOptions: OpenDialogOptions = {
    canSelectMany: false,
    openLabel: 'Select',
    canSelectFiles: false,
    canSelectFolders: true
};

export class ProjectDesignDiagramRpcManager implements ProjectDesignDiagramAPI {

    private _projectManager: BallerinaProjectManager;
    private _langClient: ExtendedLangClient;
    private _context: ExtensionContext;
    private _isChoreoProject: boolean;
    private _activeChoreoProject: Project;

    constructor() {
        this._langClient = StateMachine.langClient();
        this._context = extension.context;
        this._projectManager = new BallerinaProjectManager();
    }

    async createComponent(params: CreateComponentRequest): Promise<CreateComponentResponse> {
        return new Promise(async (resolve) => {
            // if (this._projectManager instanceof ChoreoProjectManager && 'repositoryInfo' in params) {
            //     return this._projectManager.createLocalComponent(params);
            // } else if (this._projectManager instanceof BallerinaProjectManager && 'directory' in params) {
            return this._projectManager.createLocalComponent(params);
            // }
            window.showErrorMessage('Error while creating component.');
        });
    }

    async getProjectDetails(): Promise<ProjectDetailsResponse> {
        return this._projectManager.getProjectDetails();
    }

    async getProjectRoot(): Promise<ProjectRootResponse> {
        return new Promise(async (resolve) => {
            const root = await this._projectManager.getProjectRoot();
            resolve({ response: root });
        });
    }

    async addConnector(params: AddConnectorRequest): Promise<AddConnectorResponse> {
        return new Promise(async (resolve) => {
            const status = await addConnector(this._langClient, params);
            resolve({ status });
        });
    }

    async pullConnector(params: AddConnectorRequest): Promise<PullConnectorResponse> {
        return new Promise(async (resolve) => {
            const status = await pullConnector(this._langClient, params);
            resolve({ status });
        });
    }

    async addLink(params: AddLinkRequest): Promise<AddLinkResponse> {
        return new Promise(async (resolve) => {
            const status = await linkServices(this._langClient, params);
            resolve({ status });
        });
    }

    async deleteLink(params: DeleteLinkRequest): Promise<DeleteLinkResponse> {
        return new Promise(async (resolve) => {
            const status = await deleteLink(this._langClient, params);
            resolve({ status: true });
        });
    }

    async pickDirectory(): Promise<DirectoryResponse> {
        return new Promise(async (resolve) => {
            const fileUri = await window.showOpenDialog(directoryPickOptions);
            if (fileUri && fileUri[0]) {
                resolve({ response: fileUri[0].fsPath });
            }
        });
    }

    async executeCommand(params: CommandRequest): Promise<CommandResponse> {
        return new Promise(async (resolve) => {
            const status = await commands.executeCommand(params.command);
            resolve({ status: true });
        });
    }

    async fetchTriggers(): Promise<BallerinaTriggersResponse> {
        return new Promise(async (resolve) => {
            const triggers = await this._langClient.getTriggers({ query: '' }) as BallerinaTriggersResponse;
            resolve(triggers);
        });
    }

    async fetchTrigger(params: BallerinaTriggerRequest): Promise<BallerinaTriggerResponse> {
        return new Promise(async (resolve) => {
            const trigger = await this._langClient.getTrigger({ id: params.triggerId }) as BallerinaTriggerResponse;
            resolve(trigger);
        });
    }

    async editDisplayLabel(params: DisplayLabelRequest): Promise<DisplayLabelResponse> {
        return new Promise(async (resolve) => {
            const status = await editDisplayLabel(this._langClient, params.annotation);
            resolve({ status });
        });
    }

    async getComponentModel(): Promise<ComponentModelResponse> {
        return new Promise(async (resolve) => {
            const model = await getComponentModel(this._langClient, this._isChoreoProject);
            resolve(model);
        });
    }

    showChoreoProjectOverview(): void {
        window.showErrorMessage('Error showChoreoProjectOverview not implemented.');
    }

    deleteComponent(params: DeleteComponentRequest): void {
        window.showErrorMessage('Error showChoreoProjectOverview not implemented.');
    }

    async isChoreoProject(): Promise<ChoreoProjectResponse> {
        return new Promise(async (resolve) => {
            return this._isChoreoProject;
        });
    }

    async selectedNodeId(): Promise<SelectedNodeResponse> {
        return new Promise(async (resolve) => {
            resolve({ response: "" });
        });
    }

    async isCellView(): Promise<CellViewResponse> {
        return new Promise(async (resolve) => {
            resolve({ response: true });
        });
    }

    go2source(params: LocationRequest): void {
        go2source(params.location);
    }

    goToDesign(params: GoToDesignRequest): void {
        commands.executeCommand(PALETTE_COMMANDS.SHOW_VISUALIZER, params.filePath, params.position, true);
    }

    showDiagnosticsWarning(): void {
        const action = 'View Problems';
        window.showInformationMessage(DIAGNOSTICS_WARNING, action).then((selection) => {
            if (action === selection) {
                commands.executeCommand('workbench.action.problems.focus');
            }
        });
    }

    showErrorMessage(params: ErrorMessageRequest): void {
        window.showErrorMessage(params.message);
    }

    promptWorkspaceConversion(): void {
        const saveAction = 'Save As Workspace';
        window.showInformationMessage(MULTI_ROOT_WORKSPACE_PROMPT, saveAction).then(async (selection) => {
            if (saveAction === selection) {
                openView("OPEN_VIEW", { view: "ArchitectureDiagram" });
                this._context.globalState.update(GLOBAL_STATE_FLAG, true);
                commands.executeCommand('workbench.action.saveWorkspaceAs');
            }
        });
    }

    async checkIsMultiRootWs(): Promise<MultiRootWsResponse> {
        return new Promise(async (resolve) => {
            const status = await workspace.workspaceFile ? true : false;
            resolve({ status });
        });
    }

    async getConnectors(params: ConnectorsRequest): Promise<ConnectorsResponse> {
        return new Promise(async (resolve) => {
            const result = await this._langClient.getConnectors(params);
            if ((result as ConnectorsResponse).central) {
                resolve(result as ConnectorsResponse);
            }
            resolve({ central: [], error: "Not found" } as ConnectorsResponse);
        });
    }
}
