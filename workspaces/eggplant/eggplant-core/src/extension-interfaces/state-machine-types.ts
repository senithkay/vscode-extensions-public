import { NodePosition } from "@wso2-enterprise/syntax-tree";
import { NotificationType, RequestType } from "vscode-messenger-common";

export type MachineViews = "Overview" | "Architecture" | "ER" | "Type" | "Unsupported" | "ServiceDesigner" | "DataMapper";

export type MachineStateValue = 
| 'initialize' | 'projectDetected' | 'LSInit' | 'ready' | 'disabled' 
| { ready: 'viewReady' } | { ready: 'viewUpdate' }
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
export const getVisualizerContext: RequestType<void, VisualizerLocation> = { method: 'getVisualizerContext' };
export const onFileContentUpdate: NotificationType<void> = { method: `onFileContentUpdate` };
