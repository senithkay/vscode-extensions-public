import { NodePosition } from "@wso2-enterprise/syntax-tree";
import { NotificationType } from "vscode-messenger-common";

export type Views = "Overview" | "Architecture" | "ER" | "Type" | "Unsupported" | "ServiceDesigner" | "DataMapper";

export type MachineStateValue = 'initialize' | 'projectDetected' | 'LSInit' | 'ready' | 'disabled' | 'newProject' | { ready: 'viewReady' } | { ready: 'viewUpdate' };
 
export interface NodeLocation {
    fileName: string;
    position: NodePosition;
}

export interface VisualizerLocation {
    view?: Views;
    location?: NodeLocation;
}


export const stateChanged: NotificationType<MachineStateValue> = { method: 'stateChanged' };


export function helloWorld() {
    console.log("HELLO");
}
