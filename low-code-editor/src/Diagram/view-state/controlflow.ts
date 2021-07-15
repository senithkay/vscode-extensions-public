
export interface ControlFlowExecutionTimeState {
    value: number;
    x?: number;
    y?: number;
    h?: number;
}
export interface ControlFlowLineState {
    x: number;
    y: number;
    h?: number;
    w?: number;
}

export class ControlFlowState {
    public lineStates?: ControlFlowLineState[] = [];
    public executionTimeStates?: ControlFlowExecutionTimeState[] = [];
}
