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
// tslint:disable:jsx-no-multiline-js
// tslint:disable: jsx-wrap-multiline
import React, { useContext, useEffect } from 'react';

import { CaptureBindingPattern, SimpleNameReference, STKindChecker, STNode, traversNode, TypedBindingPattern } from '@ballerina/syntax-tree';

import { PrimitiveBalType } from '../../../../../../../ConfigurationSpec/types';
import { Context as DiagramContext } from '../../../../../../../Contexts/Diagram';
import { getAllVariables } from "../../../../../../utils/mixins";
import { DataMapperInitVisitor, VisitingType } from '../../../../../LowCodeDiagram/DataMapper/util/data-mapper-init-visitor';
import { DataMapperMappingVisitor } from '../../../../../LowCodeDiagram/DataMapper/util/data-mapper-mapping-visitor';
import { genVariableName } from "../../../../../Portals/utils";
import { DataMapperConfig, DataMapperOutputField, ProcessConfig } from '../../../../Types';

import { GenerationType } from './OutputTypeSelector';


interface AddDataMappingConfigProps {
    processConfig: ProcessConfig;
    onCancel: () => void;
    onSave: () => void;
}

enum DataMapperSteps {
    SELECT_OUTPUT,
    SELECT_INPUT,
}

export function AddDataMappingConfig(props: AddDataMappingConfigProps) {
    const { processConfig, onCancel, onSave } = props;
    const { props: { stSymbolInfo }, actions: { dataMapperStart } } = useContext(DiagramContext);

    useEffect(() => {
        onCancel();
        if (processConfig.model) {
            const mappingVisitor = new DataMapperMappingVisitor(new Map(), new Map(), new Map(), true);
            traversNode(processConfig.model, new DataMapperInitVisitor(VisitingType.OUTPUT));
            traversNode(processConfig.model, mappingVisitor);

            const outputST = processConfig.model;
            const dataMapperConfig: DataMapperConfig = {
                inputTypes: [],
                outputType: undefined
            };
            let generationType: GenerationType;
            let outputVarName: string;
            let outputVarType: string;
            let outputTypeInfo;
            const outputSymbol = outputST.typeData.symbol;

            if (STKindChecker.isAssignmentStatement(outputST)) {
                generationType = GenerationType.ASSIGNMENT;
                outputVarName = (outputST.varRef as SimpleNameReference).name.value;
            } else if (STKindChecker.isLocalVarDecl(outputST)) {
                generationType = GenerationType.NEW;
                const typedBindingPattern = outputST.typedBindingPattern as TypedBindingPattern;
                const bindingPattern = typedBindingPattern.bindingPattern as CaptureBindingPattern;
                const typeDescriptor = typedBindingPattern.typeDescriptor as any;
                outputVarName = bindingPattern.variableName.value;

                if (STKindChecker.isVarTypeDesc(typeDescriptor)) {
                    outputVarType = PrimitiveBalType.Var;
                } else if (STKindChecker.isStringTypeDesc(typeDescriptor)) {
                    outputVarType = PrimitiveBalType.String;
                } else if (STKindChecker.isIntTypeDesc(typeDescriptor)) {
                    outputVarType = PrimitiveBalType.Int;
                } else if (STKindChecker.isFloatTypeDesc(typeDescriptor)) {
                    outputVarType = PrimitiveBalType.Float;
                } else if (STKindChecker.isBooleanTypeDesc(typeDescriptor)) {
                    outputVarType = PrimitiveBalType.Boolean;
                } else if (STKindChecker.isJsonTypeDesc(typeDescriptor)) {
                    outputVarType = PrimitiveBalType.Json;
                } else if (STKindChecker.isXmlTypeDesc(typeDescriptor)) {
                    outputVarType = PrimitiveBalType.Xml;
                } else if (STKindChecker.isSimpleNameReference(typeDescriptor)) {
                    const typeSymbol = outputST.typeData.typeSymbol;
                    const moduleID = typeSymbol.moduleID;
                    outputVarType = 'record';
                    if (moduleID) {
                        outputTypeInfo = {
                            name: (typeDescriptor as SimpleNameReference).name.value,
                            orgName: moduleID.orgName,
                            moduleName: moduleID.moduleName,
                            version: moduleID.version
                        }
                    }
                } else if (STKindChecker.isRecordTypeDesc(typeDescriptor)) {
                    outputVarType = PrimitiveBalType.Record;
                } else if (typeDescriptor.kind === 'ParameterizedTypeDesc' && typeDescriptor.parameterizedType
                    && STKindChecker.isMapKeyword(typeDescriptor.parameterizedType)) {
                        outputVarType = 'map';
                }
            }

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
                                    });
                                }
                            })
                        } else if (varNode.kind === 'ResourcePathSegmentParam') {
                            const varName = (varNode as any).paramName.value;
                            mappingVisitor.getMissingVarRefList().forEach((missingVarName: string) => {
                                if (missingVarName === varName) {
                                    dataMapperConfig.inputTypes.push({
                                        type: key,
                                        name: varName
                                    })
                                }
                            })
                        }
                    })
                })
            }

            dataMapperConfig.outputType = {
                variableName: outputVarName,
                type: outputVarType,
                generationType,
                typeInfo: outputTypeInfo,
                startLine: outputST.position.startLine,
                typeDefInSameModule: outputTypeInfo?.moduleName === outputSymbol.moduleID?.moduleName
            }

            dataMapperStart(dataMapperConfig);
        } else {
            dataMapperStart({
                inputTypes: [],
                outputType: {
                    variableName: genVariableName('mappedValue', getAllVariables(stSymbolInfo)),
                    generationType: GenerationType.NEW,
                    type: PrimitiveBalType.String
                }
            });
        }
    }, []);


    return (
        <></>
    )
}

export function generateFieldStructureForJsonSample(obj: any): DataMapperOutputField[] {
    const fields: DataMapperOutputField[] = [];

    Object.keys(obj).forEach((key: string) => {
        const currentField: DataMapperOutputField = { name: key, type: '', isChanged: false }
        switch (typeof obj[key]) {
            case 'string':
                currentField.type = PrimitiveBalType.String;
                break;
            case 'boolean':
                currentField.type = PrimitiveBalType.Boolean;
                break;
            case 'number':
                currentField.type = PrimitiveBalType.Float;
                break;
            case 'object':
                if (Array.isArray(obj[key])) {
                    currentField.type = PrimitiveBalType.Array;
                } else {
                    currentField.type = 'object'; // todo: revisit with a proper field type
                    currentField.fields = generateFieldStructureForJsonSample(obj[key]);
                }
                break;
            default:
            // ignored
        }

        fields.push(currentField);
    })

    return fields;
}
