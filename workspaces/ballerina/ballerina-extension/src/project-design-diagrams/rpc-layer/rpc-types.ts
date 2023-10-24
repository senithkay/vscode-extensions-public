import { BallerinaConnectorsRequest, BallerinaConnectorsResponse, BallerinaTriggersResponse, BallerinaTriggerResponse, CMAnnotation, CMLocation, GetComponentModelResponse } from "@wso2-enterprise/ballerina-languageclient";
import { BallerinaComponentCreationParams, ChoreoComponentCreationParams } from "@wso2-enterprise/choreo-core";
import { NodePosition } from "@wso2-enterprise/syntax-tree";
import { AddConnectorArgs, AddLinkArgs, DeleteLinkArgs } from "../resources";
import { NotificationType, RequestType } from "vscode-messenger-common";


export interface RPCInterface {
    // Requests
    createComponent(args: BallerinaComponentCreationParams | ChoreoComponentCreationParams): Promise<string | boolean>;
    getProjectDetails(): Promise<unknown>;
    getProjectRoot(): Promise<string | undefined>;
    getConnectors(args: BallerinaConnectorsRequest[]): Promise<BallerinaConnectorsResponse>;
    addConnector(args: AddConnectorArgs): Promise<boolean>;
    pullConnector(args: AddConnectorArgs): Promise<boolean>;
    addLink(args: AddLinkArgs): Promise<boolean>;
    deleteLink(args: DeleteLinkArgs): Promise<void>;
    pickDirectory(): Promise<string | undefined>;
    executeCommand(cmd: string): Promise<boolean>;
    fetchTriggers(): Promise<BallerinaTriggersResponse | {}>;
    fetchTrigger(triggerId: string): Promise<BallerinaTriggerResponse | {}>;
    editDisplayLabel(annotation: CMAnnotation): Promise<boolean>;
    getComponentModel(): Promise<GetComponentModelResponse>;
    showChoreoProjectOverview(): Promise<void>;
    deleteComponent(props: DeleteComponentProps): Promise<void>;
    isChoreoProject(): Promise<boolean>;
    selectedNodeId(): string;
    isCellView(): boolean;

    // Notifications
    go2source(location: CMLocation): void;
    goToDesign(args: { filePath: string, position: NodePosition }): void;
    showDiagnosticsWarning(): void;
    showErrorMsg(msg: string): void;
    promptWorkspaceConversion(): void;
    checkIsMultiRootWs(): Promise<boolean>;
}


export interface DeleteComponentProps {
    location: CMLocation;
    deletePkg: boolean;
}

const PRE_FIX = "project-design/"

export const createComponent: RequestType<BallerinaComponentCreationParams | ChoreoComponentCreationParams, string | boolean> = { method: `${PRE_FIX}createComponent` };
export const getProjectDetails: RequestType<void, unknown> = { method: `${PRE_FIX}getProjectDetails` };
export const getProjectRoot: RequestType<void, string | undefined> = { method: `${PRE_FIX}getProjectRoot` };
export const getConnectors: RequestType<BallerinaConnectorsRequest[], BallerinaConnectorsResponse> = { method: `${PRE_FIX}getConnectors` };
export const addConnector: RequestType<AddConnectorArgs, boolean> = { method: `${PRE_FIX}addConnector` };
export const pullConnector: RequestType<AddConnectorArgs, boolean> = { method: `${PRE_FIX}pullConnector` };
export const addLink: RequestType<AddLinkArgs, boolean> = { method: `${PRE_FIX}addLink` };
export const deleteLink: RequestType<DeleteLinkArgs, void> = { method: `${PRE_FIX}deleteLink` };
export const pickDirectory: RequestType<void, string | undefined> = { method: `${PRE_FIX}pickDirectory` };
export const executeCommand: RequestType<string, boolean> = { method: `${PRE_FIX}executeCommand` };
export const fetchTriggers: RequestType<void, BallerinaTriggersResponse | {}> = { method: `${PRE_FIX}fetchTriggers` };
export const fetchTrigger: RequestType<string, BallerinaTriggerResponse | {}> = { method: `${PRE_FIX}fetchTrigger` };
export const editDisplayLabel: RequestType<CMAnnotation, boolean> = { method: `${PRE_FIX}editDisplayLabel` };
export const getComponentModel: RequestType<void, GetComponentModelResponse> = { method: `${PRE_FIX}getComponentModel` };
export const showChoreoProjectOverview: RequestType<void, void> = { method: `${PRE_FIX}showChoreoProjectOverview` };
export const deleteComponent: RequestType<DeleteComponentProps, void> = { method: `${PRE_FIX}deleteComponent` };
export const isChoreoProject: RequestType<void, boolean> = { method: `${PRE_FIX}isChoreoProject` };
export const selectedNodeId: RequestType<void, string> = { method: `${PRE_FIX}selectedNodeId` };
export const isCellView: RequestType<void, boolean> = { method: `${PRE_FIX}isCellView` };

export const go2source: NotificationType<CMLocation> = { method: `${PRE_FIX}go2source` };
export const goToDesign: NotificationType<{ filePath: string, position: NodePosition }> = { method: `${PRE_FIX}goToDesign` };
export const showDiagnosticsWarning: NotificationType<void> = { method: `${PRE_FIX}showDiagnosticsWarning` };
export const showErrorMsg: NotificationType<string> = { method: `${PRE_FIX}showErrorMsg` };
export const promptWorkspaceConversion: NotificationType<void> = { method: `${PRE_FIX}promptWorkspaceConversion` };
export const checkIsMultiRootWs: NotificationType<void> = { method: `${PRE_FIX}checkIsMultiRootWs` };

