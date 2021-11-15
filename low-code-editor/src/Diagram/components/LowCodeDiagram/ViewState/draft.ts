import { LocalVarDecl, NodePosition } from "@ballerina/syntax-tree";

import { BallerinaConnectorInfo } from "../../../../Definitions/lang-client-extended";

import { StatementViewState } from ".";

export class DraftStatementViewState extends StatementViewState {

    public type: string;
    public subType: string;
    public connector?: BallerinaConnectorInfo;
    public targetPosition: NodePosition;
    public selectedConnector?: LocalVarDecl;

    constructor() {
        super();
    }
}
