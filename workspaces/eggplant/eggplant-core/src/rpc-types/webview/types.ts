


export type EggplantModel = {
    id: string;
    name: string;
    nodes: Node[];
    balFilename: string;
};

export type Node = {
    id?: string;
    name: string;
    templateId: string;
    inputPorts: InputPort[];
    outputPorts: OutputPort[];
    codeLocation: CodeLocation;
    canvasPosition: CanvasPosition;
    properties?: NodeProperties;
};
export type InputPort = {
    id: string;
    type: string;
    name?: string;
    sender?: string;
};
export type OutputPort = {
    id: string;
    type: string;
    receiver?: string;
};
export type CodeLocation = {
    start: LinePosition;
    end: LinePosition;
};
export type CanvasPosition = {
    x: number;
    y: number;
};
export type LinePosition = {
    line: number;
    offset: number;
};
export type NodeProperties = {
    templateId: string;
    name: string;
};
export type BalExpression = {
    expression: string;
    location: CodeLocation;
};
