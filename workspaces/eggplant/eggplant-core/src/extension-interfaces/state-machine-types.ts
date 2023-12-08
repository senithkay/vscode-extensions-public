import { NodePosition } from "@wso2-enterprise/syntax-tree";

export type Views = "Overview" | "Architecture" | "ER" | "Type" | "Unsupported" | "ServiceDesigner" | "DataMapper";

export interface NodeLocation {
    fileName: string;
    position: NodePosition;
}

export interface VisualizerLocation {
    view?: Views;
    location?: NodeLocation;
}
