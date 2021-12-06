import {
    InitializeParams, InitializeResult, Location, Position,
    Range, TextDocumentPositionParams
} from "vscode-languageserver-protocol";

import {
    BallerinaAST, BallerinaASTNode, BallerinaEndpoint,
    BallerinaSourceFragment
} from "./ast-models";

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

export interface FormField {
    typeName: string;
    name?: string;
    label?: string;
    displayName?: string;
    collectionDataType?: FormField;
    selectedDataType?: string;
    description?: string;
    defaultValue?: any;
    value?: any;
    optional?: boolean;
    fields?: FormField[];
    members?: FormField[];
    references?: FormField[];
    isReturn?: boolean;
    isArray?: boolean;
    isTypeDef?: boolean;
    isReference?: boolean;
    isStream?: boolean;
    hide?: boolean;
    aiSuggestion?: string;
    noCodeGen?: boolean;
    requestName?: string; // only for http form used when there's a request object in the request
    tooltip?: string;
    tooltipActionLink?: string;
    tooltipActionText?: string;
    isErrorType?: boolean;
    isDefaultableParam?: boolean;
    isRestParam?: boolean;
    customAutoComplete?: string[];
    validationRegex?: any;
}
export interface FunctionDefinitionInfo {
    name: string;
    documentation: string;
    parameters: FormField[];
    returnType?: FormField;
    isRemote?: boolean;
}

export interface BallerinaConnectorInfo extends Connector {
    functions: FunctionDefinitionInfo[];
    documentation?: string;
}

export interface BallerinaConnectorsRequest {
    query: string;
    packageName?: string;
    organization?: string;
    connector?: string;
    description?: string;
    template?: string;
    keyword?: string;
    ballerinaVersion?: string;
    platform?: boolean;
    userPackages?: boolean;
    limit?: number;
    offset?: number;
    sort?: string;
    targetFile?: string;
}
export interface BallerinaConnectorsResponse {
    central: Connector[];
    local?: Connector[];
    error?: string;
}

// tslint:disable-next-line: no-empty-interface
export interface BallerinaConnectorRequest extends Connector {
}

export interface BallerinaConnectorResponse extends BallerinaConnectorInfo {
    error?: string;
}
export interface Package {
    organization: string;
    name: string;
    version: string;
    platform?: string;
    languageSpecificationVersion?: string;
    URL?: string;
    balaURL?: string;
    balaVersion?: string;
    digest?: string;
    summary?: string;
    readme?: string;
    template?: boolean;
    licenses?: any[];
    authors?: any[];
    sourceCodeLocation?: string;
    keywords?: any[];
    ballerinaVersion?: string;
    icon?: string;
    pullCount?: number;
    createdDate?: number;
    modules?: any[];
}

export interface Connector {
    id?: string;
    name: string;
    displayName?: string;
    moduleName?: string;
    package: Package;
    displayAnnotation?: any;
}

export interface IBallerinaLangClient {

    // isInitialized: boolean;

    //    init: (params?: InitializeParams) => Thenable<InitializeResult>;

    getProjectAST: (params: GetProjectASTParams) => Thenable<GetProjectASTResponse>;

    getAST: (params: GetASTParams) => Thenable<GetASTResponse>;

    getSyntaxTree: (params: GetSyntaxTreeParams) => Thenable<GetSyntaxTreeResponse>;

    astDidChange: (params: ASTDidChangeParams) => Thenable<ASTDidChangeResponse>;

    fetchExamples: (params: BallerinaExampleListParams) => Thenable<BallerinaExampleListResponse>;

    parseFragment: (params: BallerinaSourceFragment) => Thenable<BallerinaASTNode>;

    getEndpoints: () => Thenable<BallerinaEndpoint[]>;

    getBallerinaProject: (params: GetBallerinaProjectParams) => Thenable<BallerinaProject>;

    getDefinitionPosition: (params: TextDocumentPositionParams) => Thenable<Location>;

    getRecord: (params: BallerinaRecordRequest) => Thenable<BallerinaRecordResponse>;

    getConnector: (params: BallerinaConnectorRequest) => Thenable<BallerinaConnectorResponse>;

    getConnectors: (params: BallerinaConnectorsRequest) => Thenable<BallerinaConnectorsResponse>;

    goToSource: (params: GoToSourceParams) => void;

    revealRange: (params: RevealRangeParams) => void;

    // close: () => void;
}
