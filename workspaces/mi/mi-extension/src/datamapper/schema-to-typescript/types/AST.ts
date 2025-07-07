/**
 * This file includes code originally from:
 *   json-schema-to-typescript (https://github.com/bcherny/json-schema-to-typescript)
 *   Copyright (c) Boris Cherny
 *   Licensed under the MIT License: https://opensource.org/licenses/MIT
 *
 * Modifications and additional code copyright (c) 2025, WSO2 LLC. (https://www.wso2.com)
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import {JSONSchema4Type} from 'json-schema';

export type AST_TYPE = AST['type'];

export type AST =
  | TAny
  | TArray
  | TBoolean
  | TEnum
  | TInterface
  | TNamedInterface
  | TIntersection
  | TLiteral
  | TNever
  | TNumber
  | TNull
  | TObject
  | TReference
  | TString
  | TTuple
  | TUnion
  | TUnknown
  | TCustomType;

export interface AbstractAST {
  comment?: string
  keyName?: string
  standaloneName?: string
  type: AST_TYPE
  deprecated?: boolean
}

export type ASTWithComment = AST & {comment: string};
export type ASTWithName = AST & {keyName: string};
export type ASTWithStandaloneName = AST & {standaloneName: string};

export function hasComment(ast: AST): ast is ASTWithComment {
  return (
    ('comment' in ast && ast.comment != null && ast.comment !== '') ||
    // Compare to true because ast.deprecated might be undefined
    ('deprecated' in ast && ast.deprecated === true)
  );
}

export function hasStandaloneName(ast: AST): ast is ASTWithStandaloneName {
  return 'standaloneName' in ast && ast.standaloneName != null && ast.standaloneName !== '';
}

////////////////////////////////////////////     types

export interface TAny extends AbstractAST {
  type: 'ANY'
}

export interface TArray extends AbstractAST {
  type: 'ARRAY'
  params: AST
}

export interface TBoolean extends AbstractAST {
  type: 'BOOLEAN'
}

export interface TEnum extends AbstractAST {
  standaloneName: string
  type: 'ENUM'
  params: TEnumParam[]
}

export interface TEnumParam {
  ast: AST
  keyName: string
}

export interface TInterface extends AbstractAST {
  type: 'INTERFACE'
  params: TInterfaceParam[]
  superTypes: TNamedInterface[]
}

export interface TNamedInterface extends AbstractAST {
  standaloneName: string
  type: 'INTERFACE'
  params: TInterfaceParam[]
  superTypes: TNamedInterface[]
}

export interface TNever extends AbstractAST {
  type: 'NEVER'
}

export interface TInterfaceParam {
  ast: AST
  keyName: string
  isRequired: boolean
  isPatternProperty: boolean
  isUnreachableDefinition: boolean
}

export interface TIntersection extends AbstractAST {
  type: 'INTERSECTION'
  params: AST[]
}

export interface TLiteral extends AbstractAST {
  params: JSONSchema4Type
  type: 'LITERAL'
}

export interface TNumber extends AbstractAST {
  type: 'NUMBER'
}

export interface TNull extends AbstractAST {
  type: 'NULL'
}

export interface TObject extends AbstractAST {
  type: 'OBJECT'
}

export interface TReference extends AbstractAST {
  type: 'REFERENCE'
  params: string
}

export interface TString extends AbstractAST {
  type: 'STRING'
}

export interface TTuple extends AbstractAST {
  type: 'TUPLE'
  params: AST[]
  spreadParam?: AST
  minItems: number
  maxItems?: number
}

export interface TUnion extends AbstractAST {
  type: 'UNION'
  params: AST[]
}

export interface TUnknown extends AbstractAST {
  type: 'UNKNOWN'
}

export interface TCustomType extends AbstractAST {
  type: 'CUSTOM_TYPE'
  params: string
}

////////////////////////////////////////////     literals

export const T_ANY: TAny = {
  type: 'ANY',
};

export const T_ANY_ADDITIONAL_PROPERTIES: TAny & ASTWithName = {
  keyName: '[k: string]',
  type: 'ANY',
};

export const T_UNKNOWN: TUnknown = {
  type: 'UNKNOWN',
};

export const T_UNKNOWN_ADDITIONAL_PROPERTIES: TUnknown & ASTWithName = {
  keyName: '[k: string]',
  type: 'UNKNOWN',
};
