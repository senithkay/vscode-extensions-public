
export type Views = "Overview" | "Architecture" | "ER" | "Type" | "Unsupported" | "ServiceDesigner";

export interface VisualizerContext {
    view?: Views;
    location?: Location;
}
