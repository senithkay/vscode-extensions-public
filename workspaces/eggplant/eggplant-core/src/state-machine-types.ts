import { NodePosition } from "@wso2-enterprise/syntax-tree";
import { NotificationType, RequestType } from "vscode-messenger-common";

export type MachineViews = "Overview" | "EggplantDiagram" | "ServiceDesigner";

export type MachineStateValue = 
| 'initialize' 
| 'projectDetected' 
| 'LSInit' 
| 'ready' 
| 'disabled' 
| { ready: 'viewReady' } | { ready: 'viewInit' }
| { newProject: 'welcome' } | { newProject: 'create' };
 
export type EventType = "OPEN_VIEW" | "GET_STARTED" | "CANCEL_CREATION";

export type VoidCommands = "OPEN_LOW_CODE" | "OPEN_PROJECT" | "CREATE_PROJECT";

export interface VisualizerLocation {
    view?: MachineViews | null;
    documentUri?: string;
    identifier?: string;
    position?: NodePosition;
}

export interface MachineEvent {
    type: EventType;
}

export interface CommandProps {
    command: VoidCommands;
    projectName?: string;
    isService?: boolean
}

export const stateChanged: NotificationType<MachineStateValue> = { method: 'stateChanged' };
export const getVisualizerLocation: RequestType<void, VisualizerLocation> = { method: 'getVisualizerLocation' };
export const onFileContentUpdate: NotificationType<void> = { method: `onFileContentUpdate` };
export const webviewReady: NotificationType<void> = { method: `webviewReady` };
export const activityReady: NotificationType<void> = { method: `activityReady` };
