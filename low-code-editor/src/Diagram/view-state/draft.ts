import { LocalVarDecl } from "tools/syntax-tree/lib";

import { BallerinaConnectorsInfo } from "../../Definitions/lang-client-extended";

import { StatementViewState } from ".";

export interface DraftInsertPosition {
    line: number;
    column: number;
}

export interface DraftUpdateStatement {
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
