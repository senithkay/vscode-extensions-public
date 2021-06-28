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

import { CaptureBindingPattern, LocalVarDecl, RecordTypeDesc, STKindChecker, STNode, traversNode } from "@ballerina/syntax-tree";

import { PrimitiveBalType } from "../../../../ConfigurationSpec/types";
import { DiagramEditorLangClientInterface } from '../../../../Definitions/diagram-editor-lang-client-interface';
import { DataMapperConfig, DataMapperOutputTypeInfo, TypeInfo } from "../../Portals/ConfigForm/types";
import * as DataMapperComponents from '../components/InputTypes';
import { DataMapperViewState, FieldViewState } from "../viewstate";

import { DataMapperInitVisitor, VisitingType } from "./data-mapper-init-visitor";
import { DataMapperMappingVisitor } from './data-mapper-mapping-visitor';
import { DataMapperPositionVisitor, DEFAULT_OFFSET, PADDING_OFFSET } from './data-mapper-position-visitor';
import { DataPointVisitor } from './data-point-visitor';
import { ConstantVisitor } from './datamapper-constant-visitor';
import { DataMapperSizingVisitor, DEFAULT_FIELD_WIDTH, FIELD_HEIGHT } from './datamapper-sizing-visitor';
import { DataMapperState } from './types';

export const INPUT_OUTPUT_GAP = 500;

const typeDescCache: Map<string, STNode> = new Map();

export function getDataMapperComponent(type: string, args: any) {
    let DataMapperComponent = (DataMapperComponents as any)[type];
    if (DataMapperComponent) {
        return DataMapperComponent ? <DataMapperComponent {...args} /> : null;
    } else {
        DataMapperComponent = (DataMapperComponents as any).var;
        return DataMapperComponent ? <DataMapperComponent {...args} /> : null;
    }
}

export function getDefaultValueForType(type: DataMapperOutputTypeInfo, recordMap: Map<string, STNode>, returnString: string) {
    switch (type.type) {
        case PrimitiveBalType.String:
            return '""';
        case PrimitiveBalType.Boolean:
            return 'false';
        case PrimitiveBalType.Int:
            return '0';
        case PrimitiveBalType.Float:
            return '0';
        case 'decimal':
            return '0';
        case PrimitiveBalType.Union:
            const vs = type as FieldViewState;
            if (vs.unionType) {
                if (vs.unionType.includes('string')) {
                    return '""';
                } else if (vs.unionType.includes('int')
                    || vs.unionType.includes('float') || vs.unionType.includes('decimal')) {
                    return '0';
                } else if (vs.unionType.includes('boolean')) {
                    return 'false';
                } else if (vs.unionType.includes('json')) {
                    return '{}';
                }
            }
            return '';
        case PrimitiveBalType.Json:
            // todo: look into default json type
            if (type.sampleStructure) {
                try {
                    const jsonStructure = JSON.parse(type.sampleStructure);
                    resetJsonValueToDefault(jsonStructure);
                    return JSON.stringify(jsonStructure);
                } catch (e) {
                    return type.sampleStructure;
                }
            } else {
                return '{}';
            }
            break;
        case PrimitiveBalType.Xml:
            // todo: look into default xml type
            break;
        case 'record':
            if (type.fields && type.fields.length > 0) {
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
                    traversNode(recordNode, new DataMapperInitVisitor(VisitingType.OUTPUT));
                    returnString += '{'
                    recordNode.fields?.forEach((field: any, index: number) => {
                        const fieldVS = field.dataMapperViewState as FieldViewState;
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
            if (type.typeInfo) {
                const typeInfo = type.typeInfo;
                const recordIdentifier = `${typeInfo.orgName}/${typeInfo.moduleName}:${typeInfo.version}:${typeInfo.name}`;
                const recordNode: any = recordMap.get(recordIdentifier);
                if (recordNode) {
                    recordNode.dataMapperViewState = new DataMapperViewState();
                    traversNode(recordNode, new DataMapperInitVisitor(VisitingType.OUTPUT));
                    returnString += '{'
                    recordNode.fields?.forEach((field: any, index: number) => {
                        const fieldVS = field.dataMapperViewState as FieldViewState;
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
            } else {
                return '()';
            }

            return returnString;

    }
}

export function generateInlineRecordForJson(jsonStructure: any) {
    let inlineReturnType: string = '';

    Object.keys(jsonStructure).forEach(key => {
        switch (typeof jsonStructure[key]) {
            case 'string':
                inlineReturnType += `string ${key};`;
                break;
            case 'number':
                inlineReturnType += `int|float|decimal ${key};`;
                break;
            case 'boolean':
                inlineReturnType += `boolean ${key};`;
                break;
            case 'object':
                if (Array.isArray(jsonStructure[key])) {
                    // jsonStructure[key] = [];
                    // how to identify which type ?
                } else {
                    // resetJsonValueToDefault(jsonStructure[key]);
                    inlineReturnType += `record {|${generateInlineRecordForJson(jsonStructure[key])}|} ${key};`;
                }
                break;
            default:
            // ignored
        }
    });

    return inlineReturnType;
}

export async function completeMissingTypeDesc(paramNode: STNode, records: Map<string, STNode>, visitType: VisitingType, langClient: any) {
    const paramViewState: FieldViewState = paramNode.dataMapperViewState;
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
                let typeDescST;

                if (records.has(qualifiedKey)) {
                    typeDescST = JSON.parse(JSON.stringify(records.get(qualifiedKey)));
                }

                if (!typeDescST) {
                    // todo: fetch typedesc using records api
                    if (typeDescCache.has(qualifiedKey)) {
                        typeDescST = typeDescCache.get(qualifiedKey);
                    } else {
                        const record = await langClient.getRecord({
                            module: typeInfo.moduleName,
                            org: typeInfo.orgName,
                            version: typeInfo.version,
                            name: typeInfo.name
                        });

                        if (record && record.ast) {
                            const typeDefNode = record.ast;

                            if (STKindChecker.isTypeDefinition(typeDefNode)) {
                                const typeDescNode = typeDefNode.typeDescriptor;
                                if (STKindChecker.isRecordTypeDesc(typeDescNode)) {
                                    typeDescST = typeDescNode;
                                    typeDescCache.set(qualifiedKey, typeDescNode)
                                }
                            } else if (STKindChecker.isRecordTypeDesc(typeDefNode)) {
                                typeDescST = typeDefNode;
                                typeDescCache.set(qualifiedKey, typeDefNode)
                            }

                        }
                    }
                }

                if (typeDescST) {
                    typeDescST.dataMapperViewState = paramNode.dataMapperViewState;
                    traversNode(typeDescST, new DataMapperInitVisitor(visitType));

                    switch (typeDescST.kind) {
                        case 'RecordTypeDesc':
                            await Promise.all((typeDescST as RecordTypeDesc).fields.map(async (field: any) => {
                                await completeMissingTypeDesc(field, records, visitType, langClient);
                            }))
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

export function dataMapperSizingAndPositioningRecalculate(
    inputSTNodes: STNode[], outputSTNode: STNode, stSymbolInfo: any,
    showAddVariableForm: boolean, dataMapperConfig: DataMapperConfig,
    updateDataMapperConfig: (config: DataMapperConfig) => void,
    showConfigureOutputForm: boolean,
    isJsonRecordTypeSelected: boolean,
    isExistingOutputSelected: boolean,
    squashConstants?: boolean
) {

    let maxFieldWidth: number = DEFAULT_FIELD_WIDTH;

    const constantVisitor = new ConstantVisitor();

    if (outputSTNode) {
        traversNode(outputSTNode, constantVisitor);
    }

    let constantHeight = 15;

    if (squashConstants) {
        constantVisitor.getConstantsMap().forEach(constantVS => {
            constantVS.bBox.x = 15 + PADDING_OFFSET;
            constantVS.bBox.y = constantHeight + PADDING_OFFSET;
            constantVS.bBox.h = FIELD_HEIGHT;

            constantHeight += DEFAULT_OFFSET * 2;
        });
    } else {
        constantVisitor.getConstantList().forEach(constantVS => {
            constantVS.bBox.x = 15 + PADDING_OFFSET;
            constantVS.bBox.y = constantHeight + PADDING_OFFSET;
            constantVS.bBox.h = FIELD_HEIGHT;

            constantHeight += DEFAULT_OFFSET * 2;
        })
    }

    const positionVisitor = new DataMapperPositionVisitor(constantHeight, 15);
    const dataMapperInputSizingVisitor = new DataMapperSizingVisitor();

    if (inputSTNodes.length > 0) {

        inputSTNodes.forEach((node: STNode) => {
            traversNode(node, dataMapperInputSizingVisitor);
        });

        inputSTNodes.forEach((node: STNode) => {
            traversNode(node, positionVisitor);
        });

        maxFieldWidth = dataMapperInputSizingVisitor.getMaxWidth();

        dataMapperInputSizingVisitor.getViewStateMap().forEach(viewstate => {
            viewstate.bBox.w = maxFieldWidth;
        });

        if (squashConstants) {
            constantVisitor.getConstantsMap().forEach(constantVS => {
                constantVS.bBox.w = maxFieldWidth;
            });
        } else {
            constantVisitor.getConstantList().forEach(constantVS => {
                constantVS.bBox.w = maxFieldWidth;
            });
        }
    }

    if (outputSTNode) {
        /*
         * flow:
         * Run init visitors and set defaults for everything
         * Run sizing visitor and calculate height and width for input and output seperately
         * Run position visitor and set the positions
         * Run data point visitor extract out the data points in the diagram
         * Run mapping visitor to identify connections between positions
         */
        // start: sizing visitor
        const dataMapperOutputSizingVisitor = new DataMapperSizingVisitor();
        traversNode(outputSTNode, dataMapperOutputSizingVisitor);

        if (dataMapperInputSizingVisitor.getMaxWidth() < dataMapperOutputSizingVisitor.getMaxWidth()) {
            maxFieldWidth = dataMapperOutputSizingVisitor.getMaxWidth();
        } else if (dataMapperInputSizingVisitor.getMaxWidth() > dataMapperOutputSizingVisitor.getMaxWidth()) {
            maxFieldWidth = dataMapperInputSizingVisitor.getMaxWidth();
        } else {
            maxFieldWidth = dataMapperInputSizingVisitor.getMaxWidth();
        }

        dataMapperInputSizingVisitor.getViewStateMap().forEach(viewstate => {
            viewstate.bBox.w = maxFieldWidth;
        });

        dataMapperOutputSizingVisitor.getViewStateMap().forEach(viewstate => {
            viewstate.bBox.w = maxFieldWidth;
            if ((viewstate as FieldViewState).draftViewState) {
                (viewstate as FieldViewState).draftViewState.bBox.w = maxFieldWidth;
            }
        });

        constantVisitor.getConstantsMap().forEach(constantVS => {
            constantVS.bBox.w = maxFieldWidth;
        });

        // outputHeight = ((outputSTNode as STNode).dataMapperViewState as DataMapperViewState).bBox.h;
        // end: sizing visitor

        // selected node visit
        let outputStartHeight = 15;
        if (showConfigureOutputForm && !isExistingOutputSelected) {
            if (isJsonRecordTypeSelected) {
                outputStartHeight += 332 + 64 + 15;
            } else {
                outputStartHeight += 265 + 64;
            }
        }

        if (showConfigureOutputForm && isExistingOutputSelected) {
            outputStartHeight += 172 + 64;
        }

        positionVisitor.setHeight(outputStartHeight);
        positionVisitor.setOffset(maxFieldWidth + INPUT_OUTPUT_GAP);
        traversNode(outputSTNode, positionVisitor);

    }


    // datapoint poisitions
    const dataPointVisitor = new DataPointVisitor(maxFieldWidth, maxFieldWidth + INPUT_OUTPUT_GAP - 25);

    inputSTNodes.forEach((node: STNode) => {
        traversNode(node, dataPointVisitor);
    });

    if (outputSTNode) {
        traversNode(outputSTNode, dataPointVisitor);
        const mappingVisitor = new DataMapperMappingVisitor(
            dataPointVisitor.sourcePointMap,
            dataPointVisitor.targetPointMap,
            dataPointVisitor.constantPointMap,
            squashConstants
        );
        traversNode(outputSTNode, mappingVisitor);
        if (mappingVisitor.getMissingVarRefList().length > 0) {
            stSymbolInfo.variables.forEach((value: STNode[], key: string) => {
                value.forEach((varNode: STNode) => {
                    if (STKindChecker.isLocalVarDecl(varNode)) {
                        const varName = (varNode.typedBindingPattern.bindingPattern as CaptureBindingPattern)
                            .variableName.value;
                        mappingVisitor.getMissingVarRefList().forEach((missingVarName: string) => {
                            if (missingVarName === varName) {
                                dataMapperConfig.inputTypes.push({
                                    type: key,
                                    name: varName,
                                    // node: varNode
                                });
                            }
                        })
                    } else if (STKindChecker.isRequiredParam(varNode)) {
                        const varName = varNode.paramName.value;
                        mappingVisitor.getMissingVarRefList().forEach((missingVarName: string) => {
                            if (missingVarName === varName) {
                                dataMapperConfig.inputTypes.push({
                                    type: key,
                                    name: varName,
                                    // node: varNode
                                });
                            }
                        })
                    }
                })
            })
            updateDataMapperConfig(dataMapperConfig);
        }
    }

    return {
        // size related
        maxFieldWidth,
        // processed STs
        inputSTNodes,
        outputSTNode,
        constantMap: constantVisitor.getConstantsMap(),
        constantList: constantVisitor.getConstantList()
    }
}

export function hasReferenceConnections(node: STNode): boolean {
    if (node.dataMapperViewState) {
        const viewstate = node.dataMapperViewState as FieldViewState;

        if (viewstate.sourcePointViewState && viewstate.sourcePointViewState.connections) {
            if (viewstate.sourcePointViewState.connections.length > 0) {
                return true;
            }
        }
    }

    if (node.dataMapperTypeDescNode) {
        if (STKindChecker.isRecordTypeDesc(node.dataMapperTypeDescNode)) {
            const recordTypeDesc: RecordTypeDesc = node.dataMapperTypeDescNode as RecordTypeDesc;

            let result = false;

            for (let i = 0; i < recordTypeDesc.fields.length - 1; i++) {
                result = hasReferenceConnections(recordTypeDesc.fields[i]);

                if (result) {
                    break;
                }
            }

            return result;
        }
    }

    return false;
}


export async function addTypeDescInfo(node: STNode, recordMap: Map<string, STNode>, langClient: any) {
    let varTypeSymbol;

    if (STKindChecker.isLocalVarDecl(node) && node.initializer) {
        varTypeSymbol = node.initializer.typeData.typeSymbol;
    } else if (STKindChecker.isAssignmentStatement(node)) {
        if (STKindChecker.isSimpleNameReference(node.varRef)) {
            varTypeSymbol = node.varRef.typeData.typeSymbol;
        }
    }

    if (varTypeSymbol) {
        switch (varTypeSymbol.typeKind) {
            case PrimitiveBalType.String:
            case PrimitiveBalType.Int:
            case PrimitiveBalType.Boolean:
            case PrimitiveBalType.Float:
            case PrimitiveBalType.Json:
                break;
            default:
                if (varTypeSymbol.moduleID) {
                    const moduleId = varTypeSymbol.moduleID;
                    const qualifiedKey = `${moduleId.orgName}/${moduleId.moduleName}:${moduleId.version}:${varTypeSymbol.name}`;
                    // const recordMap: Map<string, STNode> = stSymbolInfo.recordTypeDescriptions;

                    if (recordMap.has(qualifiedKey)) {
                        node.dataMapperTypeDescNode = JSON.parse(JSON.stringify(recordMap.get(qualifiedKey)));
                    } else if (typeDescCache.has(qualifiedKey)) {
                        node.dataMapperTypeDescNode = typeDescCache.get(qualifiedKey);
                    } else {
                        // todo: fetch record/object ST
                        const record = await langClient.getRecord({
                            module: moduleId.moduleName,
                            org: moduleId.orgName,
                            version: moduleId.version,
                            name: varTypeSymbol.name
                        });

                        if (record && record.ast) {
                            const typeDefNode = record.ast;

                            if (STKindChecker.isTypeDefinition(typeDefNode)) {
                                const typeDescNode = typeDefNode.typeDescriptor;
                                if (STKindChecker.isRecordTypeDesc(typeDescNode)) {
                                    node.dataMapperTypeDescNode = typeDescNode;
                                    typeDescCache.set(qualifiedKey, typeDescNode);
                                }
                            } else if (STKindChecker.isRecordTypeDesc(typeDefNode)) {
                                node.dataMapperTypeDescNode = typeDefNode;
                                typeDescCache.set(qualifiedKey, typeDefNode);
                            }

                        }
                    }
                }
        }
    }
}

export async function initializeNodesAndUpdate(state: DataMapperState, updateState: ({ }: any) => void) {
    const {
        inputSTNodes, outputSTNode, showConfigureOutputForm, updateDataMapperConfig, stSymbolInfo,
        getDiagramEditorLangClient, langServerURL, squashConstants, dataMapperConfig,
        isInitializationInProgress } = state;

    const langClient: DiagramEditorLangClientInterface = await getDiagramEditorLangClient(langServerURL);

    let maxFieldWidth: number = 200;

    const constantVisitor = new ConstantVisitor();
    // output viewstate initialization and constant extraction
    if (outputSTNode) {
        // handle constant visitor
        await addTypeDescInfo(outputSTNode, stSymbolInfo.recordTypeDescriptions, langClient);
        traversNode(outputSTNode, new DataMapperInitVisitor(VisitingType.OUTPUT));

        if (outputSTNode.dataMapperTypeDescNode) {
            switch (outputSTNode.dataMapperTypeDescNode.kind) {
                case 'RecordTypeDesc': {
                    await Promise.all(
                        (outputSTNode.dataMapperTypeDescNode as RecordTypeDesc).fields.map(async (field: any) => {
                            await completeMissingTypeDesc(field, stSymbolInfo.recordTypeDescriptions,
                                VisitingType.OUTPUT, langClient);
                        })
                    );
                }
            }
        }

        traversNode(outputSTNode, constantVisitor);
    }

    let constantHeight = 15;

    if (squashConstants) {
        constantVisitor.getConstantsMap().forEach(constantVS => {
            constantVS.bBox.x = 15 + PADDING_OFFSET;
            constantVS.bBox.y = constantHeight + PADDING_OFFSET;
            constantVS.bBox.h = FIELD_HEIGHT;

            constantHeight += DEFAULT_OFFSET * 2;
        });
    } else {
        constantVisitor.getConstantList().forEach(constantVS => {
            constantVS.bBox.x = 15 + PADDING_OFFSET;
            constantVS.bBox.y = constantHeight + PADDING_OFFSET;
            constantVS.bBox.h = FIELD_HEIGHT;

            constantHeight += DEFAULT_OFFSET * 2;
        })
    }

    const positionVisitor = new DataMapperPositionVisitor(constantHeight, 15);
    const dataMapperInputSizingVisitor = new DataMapperSizingVisitor();

    if (inputSTNodes.length > 0) {
        await Promise.all(inputSTNodes.map(async (node: STNode) => {
            if (STKindChecker.isLocalVarDecl(node)) {
                const varSTNode: LocalVarDecl = node as LocalVarDecl;
                await addTypeDescInfo(varSTNode, stSymbolInfo.recordTypeDescriptions, langClient);

                traversNode(node, new DataMapperInitVisitor(VisitingType.INPUT));
                if (node.dataMapperTypeDescNode) {
                    switch (node.dataMapperTypeDescNode.kind) {
                        case 'RecordTypeDesc': {
                            await Promise.all((node.dataMapperTypeDescNode as RecordTypeDesc).fields.map(async (field: any) => {
                                await completeMissingTypeDesc(field, stSymbolInfo.recordTypeDescriptions,
                                    VisitingType.INPUT, langClient);
                            }));
                        }
                    }
                }
            } else {
                traversNode(node, new DataMapperInitVisitor(VisitingType.INPUT));
            }
        }));

        inputSTNodes.forEach((node: STNode) => {
            traversNode(node, dataMapperInputSizingVisitor);
        });

        inputSTNodes.forEach((node: STNode) => {
            traversNode(node, positionVisitor);
        });

        maxFieldWidth = dataMapperInputSizingVisitor.getMaxWidth();

        dataMapperInputSizingVisitor.getViewStateMap().forEach(viewstate => {
            viewstate.bBox.w = maxFieldWidth;
        });

        constantVisitor.getConstantsMap().forEach(constantVS => {
            constantVS.bBox.w = maxFieldWidth;
        });
    }

    if (outputSTNode) {
        /*
         * flow:
         * Run init visitors and set defaults for everything
         * Run sizing visitor and calculate height and width for input and output seperately
         * Run position visitor and set the positions
         * Run data point visitor extract out the data points in the diagram
         * Run mapping visitor to identify connections between positions
         */

        // start: sizing visitor
        const dataMapperOutputSizingVisitor = new DataMapperSizingVisitor();
        traversNode(outputSTNode, dataMapperOutputSizingVisitor);

        if (dataMapperInputSizingVisitor.getMaxWidth() < dataMapperOutputSizingVisitor.getMaxWidth()) {
            maxFieldWidth = dataMapperOutputSizingVisitor.getMaxWidth();
        } else if (dataMapperInputSizingVisitor.getMaxWidth() > dataMapperOutputSizingVisitor.getMaxWidth()) {
            maxFieldWidth = dataMapperInputSizingVisitor.getMaxWidth();
        } else {
            maxFieldWidth = dataMapperInputSizingVisitor.getMaxWidth();
        }

        dataMapperInputSizingVisitor.getViewStateMap().forEach(viewstate => {
            viewstate.bBox.w = maxFieldWidth;
        });

        dataMapperOutputSizingVisitor.getViewStateMap().forEach(viewstate => {
            viewstate.bBox.w = maxFieldWidth;
        });

        if (squashConstants) {
            constantVisitor.getConstantsMap().forEach(constantVS => {
                constantVS.bBox.w = maxFieldWidth;
            });
        } else {
            constantVisitor.getConstantList().forEach(constantVS => {
                constantVS.bBox.w = maxFieldWidth;
            });
        }

        // outputHeight = ((outputSTNode as STNode).dataMapperViewState as DataMapperViewState).bBox.h;
        // end: sizing visitor

        // selected node visit
        positionVisitor.setHeight(15);
        positionVisitor.setOffset(maxFieldWidth + INPUT_OUTPUT_GAP);
        traversNode(outputSTNode, positionVisitor);

    }


    // datapoint poisitions
    const dataPointVisitor = new DataPointVisitor(maxFieldWidth, maxFieldWidth + INPUT_OUTPUT_GAP - 25);

    inputSTNodes.forEach((node: STNode) => {
        traversNode(node, dataPointVisitor);
    });

    if (outputSTNode) {
        traversNode(outputSTNode, dataPointVisitor);
        const mappingVisitor = new DataMapperMappingVisitor(
            dataPointVisitor.sourcePointMap,
            dataPointVisitor.targetPointMap,
            dataPointVisitor.constantPointMap,
            squashConstants
        );

        traversNode(outputSTNode, mappingVisitor);
        if (mappingVisitor.getMissingVarRefList().length > 0) {
            const inputVarNameList = dataMapperConfig.inputTypes.map(inputType => inputType.name);
            stSymbolInfo.variables.forEach((value: STNode[], key: string) => {
                value.forEach((varNode: STNode) => {
                    if (STKindChecker.isLocalVarDecl(varNode)) {
                        const varName = (varNode.typedBindingPattern.bindingPattern as CaptureBindingPattern)
                            .variableName.value;
                        mappingVisitor.getMissingVarRefList().forEach((missingVarName: string) => {
                            if (missingVarName === varName && inputVarNameList.indexOf(varName) === -1) {
                                dataMapperConfig.inputTypes.push({
                                    type: key,
                                    name: varName,
                                    // node: varNode
                                });
                            }
                        })
                    } else if (STKindChecker.isRequiredParam(varNode)) {
                        const varName = varNode.paramName.value;
                        mappingVisitor.getMissingVarRefList().forEach((missingVarName: string) => {
                            if (missingVarName === varName && inputVarNameList.indexOf(varName) === -1) {
                                dataMapperConfig.inputTypes.push({
                                    type: key,
                                    name: varName,
                                    // node: varNode
                                });
                            }
                        })
                    } else if (varNode.kind === 'ResourcePathSegmentParam') {
                        const varName = (varNode as any).paramName.value;

                        mappingVisitor.getMissingVarRefList().forEach((missingVarName: string) => {
                            if (missingVarName === varName && inputVarNameList.indexOf(varName) === -1) {
                                dataMapperConfig.inputTypes.push({
                                    type: key,
                                    name: varName,
                                    // node: varNode
                                });
                            }
                        });
                    }
                });
            });
            updateDataMapperConfig(dataMapperConfig);
        }
    }

    updateState({
        inputSTNodes,
        outputSTNode,
        stSymbolInfo,
        draftArrows: [],
        constantMap: constantVisitor.getConstantsMap(),
        constantList: constantVisitor.getConstantList(),
        maxFieldWidth,
        isInitializationInProgress: false
    })
}

export function convertMemberViewStateToString(memeberTypeVS: FieldViewState): string {
    if (memeberTypeVS.type === PrimitiveBalType.Collection) {
        return `${convertMemberViewStateToString(memeberTypeVS.memberType)}${memeberTypeVS.isArray ? '[]' : ''}`;
    } else {
        return `${memeberTypeVS.type}${memeberTypeVS.isArray ? '[]' : ''}`
    }
}
