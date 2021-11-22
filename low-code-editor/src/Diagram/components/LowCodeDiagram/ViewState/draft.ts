import { LocalVarDecl, NodePosition } from "@ballerina/syntax-tree";
import { BallerinaConnectorInfo } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

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
