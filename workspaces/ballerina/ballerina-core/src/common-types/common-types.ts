/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
export enum PrimitiveBalType {
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

export enum OtherBalType {
    Map = "map",
    Object = "object",
    Stream = "stream",
    Table = "table",
    Null = "()"
}

export const AnydataType = "anydata";
