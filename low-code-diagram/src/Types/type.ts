import { VisibleEndpoint } from "@wso2-enterprise/syntax-tree";

import { StatementViewState } from "../ViewState";

export interface ErrorSnippet {
    diagnosticMsgs?: string,
    code?: string,
    severity?: string
}

export interface Endpoint {
    visibleEndpoint: VisibleEndpoint;
    actions?: StatementViewState[];
    firstAction?: StatementViewState;
}
