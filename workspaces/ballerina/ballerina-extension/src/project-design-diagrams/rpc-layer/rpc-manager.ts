import { ChoreoProjectManager } from "@wso2-enterprise/choreo-client/lib/manager";
import { DeleteComponentProps, RPCInterface } from "./rpc-types";
import { BallerinaProjectManager } from "../utils/project-utils/manager";
import { BallerinaComponentCreationParams, ChoreoComponentCreationParams } from "@wso2-enterprise/choreo-core";
import { ExtensionContext, Location, OpenDialogOptions, commands, window, workspace } from "vscode";
import { BallerinaConnectorsRequest, BallerinaConnectorsResponse, BallerinaTriggerResponse, BallerinaTriggersResponse, CMAnnotation, CMLocation, GetComponentModelResponse } from "@wso2-enterprise/ballerina-languageclient";
import { ExtendedLangClient } from "../../core";
import { AddConnectorArgs, AddLinkArgs, DIAGNOSTICS_WARNING, DeleteLinkArgs, GLOBAL_STATE_FLAG, MULTI_ROOT_WORKSPACE_PROMPT } from "../resources";
import { addConnector, checkIsChoreoProject, deleteProjectComponent, getActiveChoreoProject, getComponentModel, go2source, linkServices, pullConnector, showChoreoProjectOverview } from "../utils";
import { deleteLink, editDisplayLabel } from "../utils/component-utils";
import { NodePosition } from "@wso2-enterprise/syntax-tree";
import { PALETTE_COMMANDS } from "../../project/activator";
import { disposeDiagramWebview } from "../activator";
import { Project } from "@wso2-enterprise/choreo-core";

const directoryPickOptions: OpenDialogOptions = {
    canSelectMany: false,
    openLabel: 'Select',
    canSelectFiles: false,
    canSelectFolders: true
};

export class RPCManger implements RPCInterface {

    private _projectManager: ChoreoProjectManager | BallerinaProjectManager;
    private _langClient: ExtendedLangClient;
    private _context: ExtensionContext;
    private _isChoreoProject: boolean;
    private _activeChoreoProject: Project;

    constructor(isChoreoProject: boolean, langClient: ExtendedLangClient, context: ExtensionContext) {
        this._langClient = langClient;
        this._context = context;
        this._isChoreoProject = isChoreoProject;
        if (isChoreoProject) {
            this._projectManager = new ChoreoProjectManager();
        } else {
            this._projectManager = new BallerinaProjectManager();
        }
    }

    createComponent(args: BallerinaComponentCreationParams | ChoreoComponentCreationParams): Promise<string | boolean> {
        if (this._projectManager instanceof ChoreoProjectManager && 'repositoryInfo' in args) {
            return this._projectManager.createLocalComponent(args);
        } else if (this._projectManager instanceof BallerinaProjectManager && 'directory' in args) {
            return this._projectManager.createLocalComponent(args);
        }
        window.showErrorMessage('Error while creating component.');
    }


    getProjectDetails(): Promise<unknown> {
        return this._projectManager.getProjectDetails();
    }

    getProjectRoot(): Promise<string> {
        return this._projectManager.getProjectRoot();
    }


    getConnectors(args: BallerinaConnectorsRequest[]): Promise<BallerinaConnectorsResponse> {
        return this._langClient.getConnectors(args[0]).then(result => {
            if ((result as BallerinaConnectorsResponse).central) {
                return Promise.resolve(result as BallerinaConnectorsResponse);
            }
            return Promise.resolve({ central: [], error: "Not found" } as BallerinaConnectorsResponse);
        });
    }

    addConnector(args: AddConnectorArgs): Promise<boolean> {
        return addConnector(this._langClient, args);
    }


    pullConnector(args: AddConnectorArgs): Promise<boolean> {
        return pullConnector(this._langClient, args);
    }

    addLink(args: AddLinkArgs): Promise<boolean> {
        return linkServices(this._langClient, args);
    }

    deleteLink(args: DeleteLinkArgs): Promise<void> {
        return deleteLink(this._langClient, args);
    }


    async pickDirectory(): Promise<string> {
        const fileUri = await window.showOpenDialog(directoryPickOptions);
        if (fileUri && fileUri[0]) {
            return fileUri[0].fsPath;
        }
    }

    async executeCommand(cmd: string): Promise<boolean> {
        return commands.executeCommand(cmd);
    }

    fetchTriggers(): Promise<{} | BallerinaTriggersResponse> {
        return this._langClient.getTriggers({ query: '' });
    }

    fetchTrigger(triggerId: string): Promise<{} | BallerinaTriggerResponse> {
        return this._langClient.getTrigger({ id: triggerId });
    }

    editDisplayLabel(annotation: CMAnnotation): Promise<boolean> {
        return editDisplayLabel(this._langClient, annotation);
    }

    go2source(location: CMLocation): void {
        go2source(location);
    }

    goToDesign(args: { filePath: string; position: NodePosition; }): void {
        commands.executeCommand(PALETTE_COMMANDS.OPEN_IN_DIAGRAM, args.filePath, args.position, true);
    }

    showDiagnosticsWarning(): void {
        const action = 'View Problems';
        window.showInformationMessage(DIAGNOSTICS_WARNING, action).then((selection) => {
            if (action === selection) {
                commands.executeCommand('workbench.action.problems.focus');
            }
        });
    }

    showErrorMsg(msg: string): void {
        window.showErrorMessage(msg);
    }

    async checkIsMultiRootWs(): Promise<boolean> {
        return workspace.workspaceFile ? true : false;
    }

    promptWorkspaceConversion(): void {
        const saveAction = 'Save As Workspace';
        window.showInformationMessage(MULTI_ROOT_WORKSPACE_PROMPT, saveAction).then(async (selection) => {
            if (saveAction === selection) {
                disposeDiagramWebview();
                this._context.globalState.update(GLOBAL_STATE_FLAG, true);
                commands.executeCommand('workbench.action.saveWorkspaceAs');
            }
        });
    }

    async getComponentModel(): Promise<GetComponentModelResponse> {
        return getComponentModel(this._langClient, this._isChoreoProject);
    }

    async showChoreoProjectOverview(): Promise<void> {
        const isChoreoProject = await checkIsChoreoProject();
        if (isChoreoProject && !this._activeChoreoProject) {
            this._activeChoreoProject = await getActiveChoreoProject();
        }
        return showChoreoProjectOverview(this._activeChoreoProject);
    }

    async deleteComponent(props: DeleteComponentProps): Promise<void> {
        const isChoreoProject = await checkIsChoreoProject();
        if (isChoreoProject && !this._activeChoreoProject) {
            this._activeChoreoProject = await getActiveChoreoProject();
        }
        return deleteProjectComponent(isChoreoProject ? this._activeChoreoProject.id : undefined, props.location, props.deletePkg);
    }


    async isChoreoProject() {
        return this._isChoreoProject;
    }

    selectedNodeId() {
        return "";
    }

    isCellView() {
        return false;
    }

}