import { LocalVarDecl } from "@ballerina/syntax-tree";

import { BallerinaConnectorsInfo } from "../../Definitions/lang-client-extended";

import { StatementViewState } from ".";

export interface DraftInsertPosition {
    line: number;
    column: number;
}

export interface DraftUpdatePosition {
    startLine: number;
    endLine: number;
    startColumn: number;
    endColumn: number;
}

export class DraftStatementViewState extends StatementViewState {

    public type: string;
    public subType: string;
    public connector?: BallerinaConnectorsInfo;
    public targetPosition: DraftInsertPosition;
    public selectedConnector?: LocalVarDecl;

    constructor() {
        super();
    }
}
