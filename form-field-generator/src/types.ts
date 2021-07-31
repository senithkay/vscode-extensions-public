export interface FormField {
    type: PrimitiveBalType | any;
    name?: string;
    label?: string;
    displayName?: string;
    collectionDataType?: PrimitiveBalType;
    selectedDataType?: string;
    typeName?: string;
    description?: string;
    defaultValue?: any;
    value?: any;
    optional?: boolean;
    fields?: FormField[];
    references?: FormField[];
    isReturn?: boolean;
    isParam?: boolean;
    isUnion?: boolean;
    isArray?: boolean;
    isTypeDef?: boolean;
    isReference?: boolean;
    typeInfo?: NonPrimitiveBal;
    hide?: boolean;
    aiSuggestion?: string;
    noCodeGen?: boolean;
    requestName?: string; // only for http form used when there's a request object in the request
    tooltip?: string;
    isErrorType?: boolean;
}

export interface FunctionDefinitionInfo {
    label?: string;
    parameters: FormField[];
    returnType: FormField;
}

export enum PrimitiveBalType {
    String = "string",
    Record = "record",
    Union = "union",
    Int = "int",
    Float = "float",
    Boolean = "boolean",
    Collection = "collection",
    Json = "json",
    Xml = "xml",
    Nil = "nil",
    Var = "var",
    Error = "error",
}

export const httpResponse: NonPrimitiveBal = {
    orgName: 'ballerina',
    modName: 'http',
    name: 'Response',
}

export const httpRequest: NonPrimitiveBal = {
    orgName: 'ballerina',
    modName: 'http',
    name: 'Request',
}

export interface NonPrimitiveBal {
    orgName: string;
    modName: string;
    name: string;
    version?: string;
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