import { STNode } from "@wso2-enterprise/syntax-tree";

export type Views = "Overview" | "Architecture" | "ER" | "Type" | "Unsupported" | "ServiceDesigner" | "DataMapper";

export interface VisualizerLocation {
    fileName: string;
    position: Position;
}
export interface Position {
    endColumn: number;
    endLine: number;
    startColumn: number;
    startLine: number;
}
export interface VisualizerLocationContext {
    view?: Views;
    location?: VisualizerLocation;
    stNode?: STNode
}
