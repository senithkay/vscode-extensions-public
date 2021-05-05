import { InitializeParams, InitializeResult, Location, Position,
    Range, TextDocumentPositionParams} from "vscode-languageserver-protocol";

import { BallerinaAST, BallerinaASTNode, BallerinaEndpoint,
    BallerinaSourceFragment } from "./ast-models";

export interface GetProjectASTParams {
    sourceRoot: string;
}

export interface GetProjectASTResponse {
    modules: ProjectAST;
    parseSuccess: boolean;
}

export interface ProjectAST {
    [moduleName: string]: {
        name: string,
        compilationUnits: {
            [compilationUnitName: string]: {
                name: string,
                ast: BallerinaAST,
                uri: string,
            }
        }
    };
}

export interface GetASTParams {
    documentIdentifier: {
        uri: string;
    };
}

export interface GetASTResponse {
    ast: BallerinaAST;
    parseSuccess: boolean;
}

export interface ASTDidChangeResponse {
    content?: string;
}

export interface ASTDidChangeParams {
    textDocumentIdentifier: {
        uri: string;
    };
    ast: BallerinaAST;
}

export interface GoToSourceParams {
    textDocumentIdentifier: {
        uri: string;
    };
    position: Position;
}

export interface RevealRangeParams {
    textDocumentIdentifier: {
        uri: string;
    };
    range: Range;
}

export interface BallerinaExample {
    title: string;
    url: string;
}

export interface BallerinaExampleCategory {
    title: string;
    column: number;
    samples: BallerinaExample[];
}

export interface BallerinaExampleListParams {
    filter?: string;
}

export interface BallerinaExampleListResponse {
    samples: BallerinaExampleCategory[];
}

export interface BallerinaProject {
    path?: string;
    version?: string;
    author?: string;
}

export interface GetBallerinaProjectParams {
    documentIdentifier: {
        uri: string;
    };
}

export interface GetSyntaxTreeParams {
    documentIdentifier: {
        uri: string;
    };
}

export interface GetSyntaxTreeResponse {
    syntaxTree: any;
    parseSuccess: boolean;
}

export interface DidOpenParams {
    textDocument: {
        uri: string;
        languageId: string;
        text: string;
        version: number
    };
}

export interface BallerinaRecordResponse {
    org: string;
    module: string;
    version: string;
    name: string;
    ast?: STNode;
    error?: any;
}

export interface VisibleEndpoint {
    kind?: string;
    isCaller: boolean;
    moduleName: string;
    name: string;
    orgName: string;
    typeName: string;
    viewState?: any;
}
export interface NodePosition {
    startLine?: number;
    startColumn?: number;
    endLine?: number;
    endColumn?: number;
}

export interface STNode {
    kind: string;
    value?: any;
    parent?: STNode;
    viewState?: any;
    position?: any;
    typeData?: any;
    VisibleEndpoints?: VisibleEndpoint[];
    source: string;
    configurablePosition?: NodePosition;
}

export interface BallerinaRecordRequest {
    org: string;
    module: string;
    version: string;
    name: string;
}

export interface BallerinaConnectorsResponse {
    connectors: any;
}

export interface BallerinaConnectorResponse {
    org: string;
    module: string;
    version: string;
    name: string;
    ast?: STNode;
}

// tslint:disable-next-line: no-empty-interface
export interface BallerinaConnectorRequest extends Connector {
}

export interface Connector {
    org: string;
    module: string;
    version: string;
    name: string;
    displayName: string;
    beta: boolean;
    category: string;
    cacheVersion: string;
}
export interface IBallerinaLangClient {

    isInitialized: boolean;

    init: (params?: InitializeParams) => Thenable<InitializeResult>;

    getProjectAST: (params: GetProjectASTParams) => Thenable<GetProjectASTResponse>;

    getAST: (params: GetASTParams) => Thenable<GetASTResponse>;

    getSyntaxTree: (params: GetSyntaxTreeParams) => Thenable<GetSyntaxTreeResponse>;

    astDidChange: (params: ASTDidChangeParams) => Thenable<ASTDidChangeResponse>;

    fetchExamples: (params: BallerinaExampleListParams) => Thenable<BallerinaExampleListResponse>;

    parseFragment: (params: BallerinaSourceFragment) => Thenable<BallerinaASTNode> ;

    getEndpoints: () => Thenable<BallerinaEndpoint[]>;

    getBallerinaProject: (params: GetBallerinaProjectParams) => Thenable<BallerinaProject>;

    getDefinitionPosition: (params: TextDocumentPositionParams) => Thenable<Location>;

    getRecord: (params: BallerinaRecordRequest) => Thenable<BallerinaRecordResponse>;

    getConnector: (params: BallerinaConnectorRequest) => Thenable<BallerinaConnectorResponse>;

    getConnectors: () => Thenable<BallerinaConnectorsResponse>;

    goToSource: (params: GoToSourceParams) => void;

    revealRange: (params: RevealRangeParams) => void;

    close: () => void;
}
