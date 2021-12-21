/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
// tslint:disable: jsx-no-multiline-js
// tslint:disable: jsx-wrap-multiline
import React, { useContext } from "react";

import { ConfigOverlayFormStatus, STModification } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition, STNode } from "@wso2-enterprise/syntax-tree";

import { Context } from "../../../../../Contexts/Diagram";
import { LowcodeEvent, SAVE_STATEMENT } from "../../../../models";
import {
    createImportStatement,
    createLogStatement,
    createPropertyStatement,
    updateLogStatement,
    updatePropertyStatement
} from "../../../../utils/modification-util";
import { generateInlineRecordForJson, getDefaultValueForType } from "../../../LowCodeDiagram/Components/RenderingComponents/DataMapper/util";
import { DiagramOverlayPosition } from "../../../Portals/Overlay";
import { InjectableItem } from "../../FormGenerator";
import { CustomExpressionConfig, DataMapperConfig, LogConfig, ProcessConfig } from "../../Types";

import { ProcessForm } from "./ProcessForm";
import { GenerationType } from "./ProcessForm/AddDataMappingConfig/OutputTypeSelector";

export interface AddProcessFormProps {
    type: string;
    targetPosition: NodePosition;
    scopeSymbols?: string[];
    onCancel: () => void;
    onSave: () => void;
    model?: STNode;
    position: DiagramOverlayPosition;
    configOverlayFormStatus: ConfigOverlayFormStatus;
}

export function ProcessConfigForm(props: any) {
    const {
        api: {
            insights: { onEvent },
            code: {
                modifyDiagram,
            }
        },
        props: { stSymbolInfo }
    } = useContext(Context);

    const { onCancel, onSave, configOverlayFormStatus, targetPosition } = props as AddProcessFormProps;
    const { formArgs, formType, isLastMember } = configOverlayFormStatus;

    const processConfig: ProcessConfig = {
        type: formType,
        scopeSymbols: [],
        model: formArgs?.model,
        targetPosition,
    };

    const onSaveClick = () => {
        const modifications: STModification[] = [];
        if (formArgs?.expressionInjectables?.list){
            formArgs.expressionInjectables.list.forEach((item: InjectableItem) => {
                modifications.push(item.modification)
            })
        }
        if (processConfig.model) {
            switch (processConfig.type) {
                case 'Variable':
                    const propertyConfig: string = processConfig.config as string;
                    const updatePropertyStmt: STModification = updatePropertyStatement(
                        propertyConfig, formArgs?.model.position
                    );
                    modifications.push(updatePropertyStmt);
                    break;
                case 'AssignmentStatement':
                    const assignmentConfig: string = processConfig.config as string;
                    const updateAssignmentStmt: STModification = updatePropertyStatement(
                        assignmentConfig, formArgs?.model.position
                    );
                    modifications.push(updateAssignmentStmt);
                    break;
                case 'Log':
                    const logConfig: LogConfig = processConfig.config as LogConfig;
                    const updateLogStmt: STModification = updateLogStatement(
                        logConfig.type, logConfig.expression, formArgs?.model.position
                    );
                    modifications.push(updateLogStmt);
                    break;
                case 'DataMapper':
                    // TODO: handle datamapper edit scenario
                    break;
                case 'Call':
                case 'Custom':
                    const customConfig: CustomExpressionConfig = processConfig.config as CustomExpressionConfig;
                    const editCustomStatement: STModification = updatePropertyStatement(customConfig.expression, formArgs?.model.position);
                    modifications.push(editCustomStatement);
                    break;
            }
        } else {
            const modificationPosition = formArgs?.targetPosition || targetPosition;
            if (modificationPosition) {
                // todo: make this ST modification
                if (processConfig.type === "Variable") {
                    const propertyConfig: string = processConfig.config as string;
                    const addPropertyStatement: STModification = createPropertyStatement(
                        propertyConfig, modificationPosition);
                    modifications.push(addPropertyStatement);
                } else if (processConfig.type === "AssignmentStatement") {
                    const assignmentConfig: string = processConfig.config as string;
                    const addAssignmentStatement: STModification = createPropertyStatement(
                        assignmentConfig, modificationPosition);
                    modifications.push(addAssignmentStatement);
                } else if (processConfig.type === "Log") {
                    const logConfig: LogConfig = processConfig.config as
                        LogConfig;
                    const addLogStatement: STModification = createLogStatement(
                        logConfig.type, logConfig.expression, modificationPosition);
                    const addImportStatement: STModification = createImportStatement(
                        "ballerina", "log", modificationPosition);
                    modifications.push(addImportStatement);
                    modifications.push(addLogStatement);
                } else if (processConfig.type === 'DataMapper') {
                    const datamapperConfig: DataMapperConfig = processConfig.config as DataMapperConfig;
                    datamapperConfig.outputType.startLine = modificationPosition.line;
                    const defaultReturn = getDefaultValueForType(datamapperConfig.outputType, stSymbolInfo.recordTypeDescriptions, "");
                    let signatureString = '';

                    datamapperConfig.inputTypes.forEach((param, i) => {
                        signatureString += `${param.type} ${param.name}`;
                        if (i < datamapperConfig.inputTypes.length - 1) {
                            signatureString += ',';
                        }
                    })

                    let outputType = '';
                    let conversionStatement = '';

                    switch (datamapperConfig.outputType.type) {
                        case 'json':
                            // outputType = 'json';
                            // datamapperConfig.outputType.type = 'record'; // todo: handle conversion to json
                            outputType = `record {|${generateInlineRecordForJson(JSON.parse(datamapperConfig.outputType.sampleStructure))}|}`;
                            conversionStatement = `json ${datamapperConfig.outputType.variableName}Json = ${datamapperConfig.outputType.variableName}.toJson();`
                            break;
                        case 'record':
                            const outputTypeInfo = datamapperConfig.outputType?.typeInfo;
                            outputType = `${outputTypeInfo.moduleName}:${outputTypeInfo.name}`
                            break;
                        default:
                            outputType = datamapperConfig.outputType.type;
                    }


                    const functionString = `${datamapperConfig.outputType.generationType === GenerationType.NEW ? outputType : ''} ${datamapperConfig.outputType.variableName} = ${defaultReturn};`

                    const dataMapperFunction: STModification = createPropertyStatement(functionString, modificationPosition);
                    modifications.push(dataMapperFunction);
                    if (conversionStatement.length > 0) {
                        modifications.push(createPropertyStatement(conversionStatement, modificationPosition));
                    }
                } else if (processConfig.type === "Call" || processConfig.type === "Custom") {
                    const customConfig: CustomExpressionConfig = processConfig.config as CustomExpressionConfig;
                    const addCustomStatement: STModification = createPropertyStatement(customConfig.expression, modificationPosition, isLastMember);
                    modifications.push(addCustomStatement);
                }
                const event: LowcodeEvent = {
                    type: SAVE_STATEMENT,
                    name: processConfig.type
                };
                onEvent(event);
            }
        }
        modifyDiagram(modifications);
        onSave()
    };

    return (
        <ProcessForm
            config={processConfig}
            onCancel={onCancel}
            onSave={onSaveClick}
            onWizardClose={onSave}
            configOverlayFormStatus={configOverlayFormStatus}
        />
    );
}
