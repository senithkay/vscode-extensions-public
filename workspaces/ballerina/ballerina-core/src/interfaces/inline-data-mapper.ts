/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

export enum TypeKind {
    Record = "record",
    Array = "array",
    String = "string",
    Int = "int",
    Float = "float",
    Decimal = "decimal",
    Boolean = "boolean",
    Unknown = "unknown"
}

export enum InputCategory {
    Const = "const",
    ModuleVariable = "moduleVariable",
    Configurable = "configurable"
}

export interface IDMDiagnostic {
    kind: string;
    message: string;
    range: {
        start: {
            line: number;
            character: number;
        };
        end: {
            line: number;
            character: number;
        };
    };
}

export interface IOType {
    id: string;
    category?: InputCategory;
    type: Type;
}

export interface Type {
    kind?: TypeKind;
    typeName?: TypeKind;
    name?: string;
    fields?: Type[];
    memberType?: Type;
    defaultValue?: unknown;
    optional?: boolean;
}

export interface Mapping {
    output: string,
    inputs: string[];
    expression: string;
    diagnostics?: IDMDiagnostic[];
    isComplex?: boolean;
    isFunctionCall?: boolean;
}

export interface IDMModel {
    // TODO: Refine the model (remove the mappings key)
    mappings: {
        inputs: IOType[];
        output: IOType;
        mappings: Mapping[];
        source: string;
        view: string;
    }
}
