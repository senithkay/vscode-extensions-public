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

import { addTypeDescInfo } from '..';
import { PrimitiveBalType } from "../../../../ConfigurationSpec/types";
import { DataMapperConfig, DataMapperOutputTypeInfo, TypeInfo } from "../../Portals/ConfigForm/types";
import * as DataMapperComponents from '../components/InputTypes';
import { DataMapperViewState, FieldViewState } from "../viewstate";

import { DataMapperInitVisitor, VisitingType } from "./data-mapper-init-visitor";
import { DataMapperMappingVisitor } from './data-mapper-mapping-visitor';
import { DataMapperPositionVisitor, DEFAULT_OFFSET, PADDING_OFFSET } from './data-mapper-position-visitor';
import { DataPointVisitor } from './data-point-visitor';
import { ConstantVisitor } from './datamapper-constant-visitor';
import { DataMapperSizingVisitor, FIELD_HEIGHT } from './datamapper-sizing-visitor';

export function getDataMapperComponent(type: string, args: any) {
    const DataMapperComponent = (DataMapperComponents as any)[type];
    return DataMapperComponent ? <DataMapperComponent {...args} /> : null;
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

export function completeMissingTypeDesc(paramNode: STNode, records: Map<string, STNode>, visitType: VisitingType) {
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
                const typeDescST = JSON.parse(JSON.stringify(records.get(qualifiedKey)));

                if (!typeDescST) {
                    // todo: fetch typedesc using records api
                }

                if (typeDescST) {
                    typeDescST.dataMapperViewState = paramNode.dataMapperViewState;
                    traversNode(typeDescST, new DataMapperInitVisitor(visitType));

                    switch (typeDescST.kind) {
                        case 'RecordTypeDesc':
                            (typeDescST as RecordTypeDesc).fields.forEach((field: any) => {
                                completeMissingTypeDesc(field, records, visitType);
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

export function dataMapperSizingAndPositioning(inputSTNodes: STNode[], outputSTNode: STNode, stSymbolInfo: any,
                                               showAddVariableForm: boolean, dataMapperConfig: DataMapperConfig,
                                               updateDataMapperConfig: (config: DataMapperConfig) => void) {
    // let inputHeight: number = 0;
    // let outputHeight: number = 0;
    let maxFieldWidth: number = 200;

    const constantVisitor = new ConstantVisitor();
    // output viewstate initialization and constant extraction
    if (outputSTNode) {
        // handle constant visitor
        addTypeDescInfo(outputSTNode, stSymbolInfo.recordTypeDescriptions);
        traversNode(outputSTNode, new DataMapperInitVisitor(VisitingType.OUTPUT));

        if (outputSTNode.dataMapperTypeDescNode) {
            switch (outputSTNode.dataMapperTypeDescNode.kind) {
                case 'RecordTypeDesc': {
                    (outputSTNode.dataMapperTypeDescNode as RecordTypeDesc).fields.forEach((field: any) => {
                        completeMissingTypeDesc(field, stSymbolInfo.recordTypeDescriptions, VisitingType.OUTPUT);
                    })
                }
            }
        }

        traversNode(outputSTNode, constantVisitor);
    }

    let constantHeight = showAddVariableForm ? 132 : 15;

    constantVisitor.getConstantsMap().forEach(constantVS => {
        constantVS.bBox.x = 15 + PADDING_OFFSET;
        constantVS.bBox.y = constantHeight + PADDING_OFFSET;
        constantVS.bBox.h = FIELD_HEIGHT;

        constantHeight += DEFAULT_OFFSET * 2;
    })

    const positionVisitor = new DataMapperPositionVisitor(constantHeight, 15);
    const dataMapperInputSizingVisitor = new DataMapperSizingVisitor();

    if (inputSTNodes.length > 0) {
        // inputHeight = 0; // reset height from default value

        inputSTNodes.forEach((node: STNode) => {
            if (STKindChecker.isLocalVarDecl(node)) {
                const varSTNode: LocalVarDecl = node as LocalVarDecl;
                addTypeDescInfo(varSTNode, stSymbolInfo.recordTypeDescriptions);

                traversNode(node, new DataMapperInitVisitor(VisitingType.INPUT));
                if (node.dataMapperTypeDescNode) {
                    switch (node.dataMapperTypeDescNode.kind) {
                        case 'RecordTypeDesc': {
                            (node.dataMapperTypeDescNode as RecordTypeDesc).fields.forEach((field: any) => {
                                completeMissingTypeDesc(field, stSymbolInfo.recordTypeDescriptions, VisitingType.INPUT);
                            })
                        }
                    }
                }
            } else {
                traversNode(node, new DataMapperInitVisitor(VisitingType.INPUT));
            }

        });

        inputSTNodes.forEach((node: STNode) => {
            traversNode(node, dataMapperInputSizingVisitor);
        });

        // inputSTNodes.forEach((node: STNode, i: number) => {
        //     inputHeight += (node.dataMapperViewState as DataMapperViewState).bBox.h;
        //     if (i < inputSTNodes.length - 1) {
        //         inputHeight += 40 // todo: convert to constant
        //     }
        // });

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
        // outputHeight = 0; // reset height from default value
        // start: Initialization
        // end: Initialization

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

        constantVisitor.getConstantsMap().forEach(constantVS => {
            constantVS.bBox.w = maxFieldWidth;
        });

        // outputHeight = ((outputSTNode as STNode).dataMapperViewState as DataMapperViewState).bBox.h;
        // end: sizing visitor

        // selected node visit
        positionVisitor.setHeight(15);
        positionVisitor.setOffset(maxFieldWidth + 400);
        traversNode(outputSTNode, positionVisitor);

    }


    // datapoint poisitions
    const dataPointVisitor = new DataPointVisitor(maxFieldWidth, maxFieldWidth + 400 - 25);

    inputSTNodes.forEach((node: STNode) => {
        traversNode(node, dataPointVisitor);
    });

    if (outputSTNode) {
        traversNode(outputSTNode, dataPointVisitor);
        const mappingVisitor = new DataMapperMappingVisitor(dataPointVisitor.sourcePointMap, dataPointVisitor.targetPointMap, dataPointVisitor.constantPointMap)
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
        // sizing data
        // inputHeight,
        // outputHeight,
        maxFieldWidth,
        // processed STs
        inputSTNodes,
        outputSTNode,
        constantMap: constantVisitor.getConstantsMap()
    }
}

export function dataMapperSizingAndPositioningRecalculate(inputSTNodes: STNode[], outputSTNode: STNode, stSymbolInfo: any,
                                                          showAddVariableForm: boolean, dataMapperConfig: DataMapperConfig,
                                                          updateDataMapperConfig: (config: DataMapperConfig) => void) {
    // let inputHeight: number = 0;
    // let outputHeight: number = 0;
    let maxFieldWidth: number = 200;

    const constantVisitor = new ConstantVisitor();
    // output viewstate initialization and constant extraction
    if (outputSTNode) {
        // handle constant visitor
        // addTypeDescInfo(outputSTNode, stSymbolInfo.recordTypeDescriptions);
        // traversNode(outputSTNode, new DataMapperInitVisitor(VisitingType.OUTPUT));

        // if (outputSTNode.dataMapperTypeDescNode) {
        //     switch (outputSTNode.dataMapperTypeDescNode.kind) {
        //         case 'RecordTypeDesc': {
        //             (outputSTNode.dataMapperTypeDescNode as RecordTypeDesc).fields.forEach((field: any) => {
        //                 completeMissingTypeDesc(field, stSymbolInfo.recordTypeDescriptions, VisitingType.OUTPUT);
        //             })
        //         }
        //     }
        // }

        traversNode(outputSTNode, constantVisitor);
    }

    let constantHeight = showAddVariableForm ? 132 : 15;

    constantVisitor.getConstantsMap().forEach(constantVS => {
        constantVS.bBox.x = 15 + PADDING_OFFSET;
        constantVS.bBox.y = constantHeight + PADDING_OFFSET;
        constantVS.bBox.h = FIELD_HEIGHT;

        constantHeight += DEFAULT_OFFSET * 2;

        // if (constantVS.sourcePointViewState) {
        //     constantVS.sourcePointViewState.connections = [];
        // }
    })

    const positionVisitor = new DataMapperPositionVisitor(constantHeight, 15);
    const dataMapperInputSizingVisitor = new DataMapperSizingVisitor();

    if (inputSTNodes.length > 0) {
        // inputHeight = 0; // reset height from default value

        // inputSTNodes.forEach((node: STNode) => {
        //     if (STKindChecker.isLocalVarDecl(node)) {
        //         const varSTNode: LocalVarDecl = node as LocalVarDecl;
        //         addTypeDescInfo(varSTNode, stSymbolInfo.recordTypeDescriptions);

        //         traversNode(node, new DataMapperInitVisitor(VisitingType.INPUT));
        //         if (node.dataMapperTypeDescNode) {
        //             switch (node.dataMapperTypeDescNode.kind) {
        //                 case 'RecordTypeDesc': {
        //                     (node.dataMapperTypeDescNode as RecordTypeDesc).fields.forEach((field: any) => {
        //                         completeMissingTypeDesc(field, stSymbolInfo.recordTypeDescriptions, VisitingType.INPUT);
        //                     })
        //                 }
        //             }
        //         }
        //     } else {
        //         traversNode(node, new DataMapperInitVisitor(VisitingType.INPUT));
        //     }

        // });

        inputSTNodes.forEach((node: STNode) => {
            traversNode(node, dataMapperInputSizingVisitor);
        });

        // inputSTNodes.forEach((node: STNode, i: number) => {
        //     inputHeight += (node.dataMapperViewState as DataMapperViewState).bBox.h;
        //     if (i < inputSTNodes.length - 1) {
        //         inputHeight += 40 // todo: convert to constant
        //     }
        // });

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
        // outputHeight = 0; // reset height from default value
        // start: Initialization
        // end: Initialization

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

        constantVisitor.getConstantsMap().forEach(constantVS => {
            constantVS.bBox.w = maxFieldWidth;
        });

        // outputHeight = ((outputSTNode as STNode).dataMapperViewState as DataMapperViewState).bBox.h;
        // end: sizing visitor

        // selected node visit
        positionVisitor.setHeight(15);
        positionVisitor.setOffset(maxFieldWidth + 400);
        traversNode(outputSTNode, positionVisitor);

    }


    // datapoint poisitions
    const dataPointVisitor = new DataPointVisitor(maxFieldWidth, maxFieldWidth + 400 - 25);

    inputSTNodes.forEach((node: STNode) => {
        traversNode(node, dataPointVisitor);
    });

    if (outputSTNode) {
        traversNode(outputSTNode, dataPointVisitor);
        const mappingVisitor = new DataMapperMappingVisitor(dataPointVisitor.sourcePointMap, dataPointVisitor.targetPointMap, dataPointVisitor.constantPointMap)
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
        // sizing data
        // inputHeight,
        // outputHeight,
        maxFieldWidth,
        // processed STs
        inputSTNodes,
        outputSTNode,
        constantMap: constantVisitor.getConstantsMap()
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
