export interface TypeField {
    typeName: string;
    name?: string;
    displayName?: string;
    memberType?: TypeField;
    inclusionType?: TypeField;
    paramType?: TypeField;
    selectedDataType?: string;
    description?: string;
    defaultValue?: any;
    value?: any;
    optional?: boolean;
    defaultable?: boolean;
    fields?: TypeField[];
    members?: TypeField[];
    references?: TypeField[];
    restType?: TypeField;
    constraintType?: TypeField;
    rowType?: TypeField;
    keys?: string[];
    isReturn?: boolean;
    isTypeDef?: boolean;
    isReference?: boolean;
    isStream?: boolean;
    isErrorUnion?: boolean;
    typeInfo?: any;
    hide?: boolean;
    aiSuggestion?: string;
    noCodeGen?: boolean;
    requestName?: string; // only for http form used when there's a request object in the request
    tooltip?: string;
    tooltipActionLink?: string;
    tooltipActionText?: string;
    isErrorType?: boolean;
    isRestParam?: boolean; // TODO: unified rest params
    hasRestType?: boolean;
    isRestType?: boolean;
    customAutoComplete?: string[];
    validationRegex?: any;
    leftTypeParam?: any;
    rightTypeParam?: any;
    initialDiagnostics?: DiagramDiagnostic[];
    documentation?: string;
    displayAnnotation?: any;
    position?: any;
    selected?: boolean;
    originalTypeName?: string;
    resolvedUnionType?: TypeField | TypeField[];
}

export interface DiagramDiagnostic {
    message: string;
    diagnosticInfo: {
        code: string;
        severity: string;
    };
    range: any;
}

export enum TypeKind {
    String = "string",
    Record = "record",
    Union = "union",
    Enum = "enum",
    Int = "int",
    Float = "float",
    Boolean = "boolean",
    Array = "array",
    Json = "json",
    Xml = "xml",
    Nil = "nil",
    Var = "var",
    Error = "error",
    Decimal = "decimal"
}

export interface STModification {
    startLine?: number;
    startColumn?: number;
    endLine?: number;
    endColumn?: number;
    type: string;
    config?: any;
    isImport?: boolean;
}
