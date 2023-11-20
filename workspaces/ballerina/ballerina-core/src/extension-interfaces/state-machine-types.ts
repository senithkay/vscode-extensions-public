
export type Views = "Overview" | "Architecture" | "ER" | "Type" | "Unsupported";

export interface VisualizerContext {
    view?: Views;
    location?: Location;
}
