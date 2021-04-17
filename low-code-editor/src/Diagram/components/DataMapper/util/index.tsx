/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
import React from 'react';

import { RecordTypeDesc, STNode, traversNode } from "@ballerina/syntax-tree";

import { PrimitiveBalType } from "../../../../ConfigurationSpec/types";
import { TypeInfo, TypeInfoEntry } from "../../Portals/ConfigForm/types";
import * as DataMapperComponents from '../components/ParameterTypes';
import { DataMapperViewState, TypeDescViewState } from "../viewstate";

import { DataMapperInitVisitor } from "./data-mapper-init-visitor";

export function getDataMapperComponent(type: string, args: any) {
    const DataMapperComponent = (DataMapperComponents as any)[type];
    return DataMapperComponent ? <DataMapperComponent {...args} /> : null;
}

export function getDefaultValueForType(type: TypeInfoEntry, recordMap: Map<string, STNode>, returnString: string) {
    switch (type.type) {
        case PrimitiveBalType.String:
            return '""';
        case PrimitiveBalType.Boolean:
            return 'false';
        case PrimitiveBalType.Int:
            return '0';
        case PrimitiveBalType.Float:
            return '0';
        case PrimitiveBalType.Json:
            // todo: look into default json type
            if (type.sampleStructure) {
                const jsonStructure = JSON.parse(type.sampleStructure);
                resetJsonValueToDefault(jsonStructure);
                return JSON.stringify(jsonStructure);
            } else {
                return '{}';
            }
            break;
        case PrimitiveBalType.Xml:
            // todo: look into default xml type
            break;
        case 'record':
            if (type.fields) {
                returnString += '{';
                type.fields.forEach((field: any, index: number) => {
                    returnString += `${field.name}: `;
                    returnString += getDefaultValueForType(
                        field,
                        recordMap,
                        ""
                    );
                    if (index < type.fields.length - 1) {
                        returnString += ',';
                    }
                })
                returnString += '}';
            } else if (type.typeInfo) {
                const typeInfo = type.typeInfo;
                const recordIdentifier = `${typeInfo.orgName}/${typeInfo.moduleName}:${typeInfo.version}:${typeInfo.name}`;
                const recordNode: any = recordMap.get(recordIdentifier);
                if (recordNode) {
                    recordNode.dataMapperViewState = new DataMapperViewState();
                    traversNode(recordNode, new DataMapperInitVisitor());
                    returnString += '{'
                    recordNode.fields?.forEach((field: any, index: number) => {
                        const fieldVS = field.dataMapperViewState as TypeDescViewState;
                        returnString += `${fieldVS.name}: `;
                        returnString += getDefaultValueForType(
                            fieldVS,
                            recordMap,
                            ""
                        );

                        if (index < recordNode.fields.length - 1) {
                            returnString += ',';
                        }
                    });
                    returnString += '}'
                } else {
                    // todo: do the fetching!
                }
            }

            return returnString;
        default:
            return '()'; // todo: this shouldn't be the case ever
    }
}

export function completeMissingTypeDesc(paramNode: STNode, records: Map<string, STNode>) {
    const paramViewState: TypeDescViewState = paramNode.dataMapperViewState;
    switch (paramViewState.type) {
        case 'string':
        case 'int':
        case 'float':
        case 'xml':
        case 'json':
            break;
        default:
            if (paramViewState.typeInfo) {
                const typeInfo: TypeInfo = paramViewState.typeInfo;
                const qualifiedKey: string = `${typeInfo.orgName}/${typeInfo.moduleName}:${typeInfo.version}:${typeInfo.name}`;
                const typeDescST = records.get(qualifiedKey);

                if (!typeDescST) {
                    // todo: fetch typedesc using records api
                }

                if (typeDescST) {
                    typeDescST.dataMapperViewState = paramNode.dataMapperViewState;
                    traversNode(typeDescST, new DataMapperInitVisitor());

                    switch (typeDescST.kind) {
                        case 'RecordTypeDesc':
                            (typeDescST as RecordTypeDesc).fields.forEach((field: any) => {
                                completeMissingTypeDesc(field, records);
                            });
                            break;
                    }
                }

                paramViewState.type = typeDescST.dataMapperViewState.type;
                paramNode.dataMapperTypeDescNode = typeDescST;
            }
    }
}

export function resetJsonValueToDefault(json: any) {
    Object.keys(json).forEach((key: string) => {
        switch (typeof json[key]) {
            case 'string':
                json[key] = '';
                break;
            case 'boolean':
                json[key] = false;
                break;
            case 'number':
                json[key] = 0;
                break;
            case 'object':
                if (Array.isArray(json[key])) {
                    json[key] = [];
                } else {
                    resetJsonValueToDefault(json[key]);
                }

                break;
            default:
            // ignored
        }
    })
}
