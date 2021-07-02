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
import React, { useContext, useEffect, useState } from 'react';

import { CaptureBindingPattern, LocalVarDecl, SimpleNameReference, STKindChecker, STNode, traversNode, TypedBindingPattern } from '@ballerina/syntax-tree';
import { Box, FormControl, Typography } from '@material-ui/core';
import { CloseRounded } from '@material-ui/icons';

import { LogIcon } from "../../../../../../assets/icons";
import DataMapperIcon from '../../../../../../assets/icons/DataMapper';
import { PrimitiveBalType, WizardType } from '../../../../../../ConfigurationSpec/types';
import { Context as DiagramContext } from '../../../../../../Contexts/Diagram';
import { getAllVariables } from "../../../../../utils/mixins";
import { DataMapperInitVisitor, VisitingType } from '../../../../DataMapper/util/data-mapper-init-visitor';
import { DataMapperMappingVisitor } from '../../../../DataMapper/util/data-mapper-mapping-visitor';
import { ButtonWithIcon } from '../../../../Portals/ConfigForm/Elements/Button/ButtonWithIcon';
import { PrimaryButton } from '../../../../Portals/ConfigForm/Elements/Button/PrimaryButton';
import { SecondaryButton } from '../../../../Portals/ConfigForm/Elements/Button/SecondaryButton';
import { useStyles as useFormStyles } from "../../../../Portals/ConfigForm/forms/style";
import { DataMapperConfig, DataMapperInputTypeInfo, DataMapperOutputField, DataMapperOutputTypeInfo, ProcessConfig } from '../../../../Portals/ConfigForm/types';
import { checkVariableName, genVariableName } from "../../../../Portals/utils";
import { wizardStyles } from "../../../style";

import { GenerationType, OutputTypeSelector } from './OutputTypeSelector';
import { ParameterSelector } from './ParameterSelector';


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
    const { state, dataMapperStart, toggleDiagramOverlay } = useContext(DiagramContext);
    const { stSymbolInfo } = state;

    useEffect(() => {
        onCancel();
        if (processConfig.wizardType === WizardType.EXISTING) {
            const mappingVisitor = new DataMapperMappingVisitor(new Map(), new Map(), new Map(), true);
            traversNode(processConfig.model, new DataMapperInitVisitor(VisitingType.OUTPUT));
            traversNode(processConfig.model, mappingVisitor);

            const outputST = processConfig.model;
            const dataMapperConfig: DataMapperConfig = {
                inputTypes: [],
                outputType: undefined,
                wizardType: processConfig.wizardType
            };
            let generationType: GenerationType;
            let outputVarName: string;
            let outputVarType: string;
            let outputTypeInfo;

            if (STKindChecker.isAssignmentStatement(outputST)) {
                generationType = GenerationType.ASSIGNMENT;
                outputVarName = (outputST.varRef as SimpleNameReference).name.value;
            } else if (STKindChecker.isLocalVarDecl(outputST)) {
                generationType = GenerationType.NEW;
                const typedBindingPattern = outputST.typedBindingPattern as TypedBindingPattern;
                const bindingPattern = typedBindingPattern.bindingPattern as CaptureBindingPattern;
                const typeDescriptor = typedBindingPattern.typeDescriptor;
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
            }

            dataMapperStart(dataMapperConfig);
        } else {
            dataMapperStart({
                inputTypes: [],
                outputType: {
                    variableName: genVariableName('mappedValue', getAllVariables(stSymbolInfo)),
                    generationType: GenerationType.NEW,
                    type: PrimitiveBalType.String
                },
                wizardType: processConfig.wizardType
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
                    currentField.type = PrimitiveBalType.Collection;
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
