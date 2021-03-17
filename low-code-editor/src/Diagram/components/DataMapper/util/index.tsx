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

import { RecordField, RecordTypeDesc, STNode, traversNode } from "@ballerina/syntax-tree";

import { PrimitiveBalType } from "../../../../ConfigurationSpec/types";
import { TypeInfoEntry } from "../../Portals/ConfigForm/types";
import * as DataMapperComponents from '../components/ParameterTypes';
import { DataMapperViewState } from "../viewstate";

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
            break;
        case PrimitiveBalType.Xml:
            // todo: look into default xml type
            break;
        case 'record':
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
            return returnString;
        default:
            if (type.typeInfo) {
                const typeInfo = type.typeInfo;
                const recordIdentifier = `${typeInfo.orgName}/${typeInfo.moduleName}:${typeInfo.version}:${typeInfo.name}`;
                const recordNode = recordMap.get(recordIdentifier);
                if (recordNode) {
                    recordNode.dataMapperViewState = new DataMapperViewState();
                    traversNode(recordNode, new DataMapperInitVisitor(recordMap));
                    returnString += '{'
                    recordNode.dataMapperViewState.fields?.forEach((field: any, index: number) => {
                        returnString += `${field.name}: `;
                        returnString += getDefaultValueForType(
                            field,
                            recordMap,
                            ""
                        );

                        if (index < recordNode.dataMapperViewState.fields.length - 1) {
                            returnString += ',';
                        }
                    });
                    returnString += '}'
                } else {
                    // todo: do the fetching boi!
                }
                return returnString;
            } else {
                return '()'; // todo: this shouldn't be the case ever
            }
    }
}
