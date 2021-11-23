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
// tslint:disable: jsx-no-multiline-js
import React, { useEffect, useRef, useState } from "react";

import { FunctionDefinition, NodePosition, STKindChecker } from "@ballerina/syntax-tree";
import { Box, FormControl, Typography } from "@material-ui/core";
import { FormHeaderSection, PrimaryButton, SecondaryButton, STModification } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { AddIcon, FunctionIcon } from "../../../../../assets/icons";
import { Section } from "../../../../../components/ConfigPanel";
import { useDiagramContext } from "../../../../../Contexts/Diagram";
import {
    createFunctionSignature,
    updateFunctionSignature,
} from "../../../../utils/modification-util";
import { VariableNameInput, VariableNameInputProps } from "../Components/VariableNameInput";
import { VariableTypeInput, VariableTypeInputProps } from "../Components/VariableTypeInput";
import { wizardStyles as useFormStyles } from "../style";

import { FunctionParamItem } from "./FunctionParamEditor/FunctionParamItem";
import { FunctionParamSegmentEditor } from "./FunctionParamEditor/FunctionSegmentEditor";
import { FunctionParam } from "./types";

interface FunctionConfigFormProps {
    model?: FunctionDefinition;
    targetPosition?: NodePosition;
    onCancel: () => void;
    onSave: () => void;
}

export function FunctionConfigForm(props: FunctionConfigFormProps) {
    const formClasses = useFormStyles();
    const { targetPosition, model, onSave, onCancel } = props;
    const [functionName, setFunctionName] = useState("");
    const [parameters, setParameters] = useState<FunctionParam[]>([]);
    const [returnType, setReturnType] = useState(model ? model?.functionSignature?.returnTypeDesc?.type?.source : "error?");
    const [validReturnType, setValidReturnType] = useState(false)
    const [addingNewParam, setAddingNewParam] = useState(false);
    const [isFunctionNameValid, setIsFunctionNameValid] = useState(false);

    const {
        props: { syntaxTree },
        api: {
            code: { modifyDiagram },
        },
    } = useDiagramContext();
    const existingFunctionNames = useRef([]);
    const disableSaveBtn = !(functionName.length > 0) || !isFunctionNameValid || addingNewParam || !validReturnType;

    const handleOnSave = () => {
        const parametersStr = parameters
            .map((item) => `${item.type} ${item.name}`)
            .join(",");

        const returnTypeStr = returnType ? `returns ${returnType}` : "";

        const modifications: STModification[] = [];
        if (model && STKindChecker.isFunctionDefinition(model)) {
            // Perform update if model exists
            modifications.push(
                updateFunctionSignature(
                    functionName,
                    parametersStr,
                    returnTypeStr,
                    {
                        ...model?.functionSignature?.position,
                        startColumn: model?.functionName?.position?.startColumn,
                    }
                )
            );
        } else {
            // Create new function if model does not exist
            modifications.push(
                createFunctionSignature(
                    functionName,
                    parametersStr,
                    returnTypeStr,
                    {
                        startLine: targetPosition.startLine,
                        startColumn: 0,
                    }
                )
            );
        }
        modifyDiagram(modifications);
        onSave();
    };

    const updateFunctionNameValidation = (fieldName: string, isInValid: boolean) => {
        setIsFunctionNameValid(!isInValid);
    }

    const onFunctionNameChange = (name: string) => setFunctionName(name);

    // Param related functions
    const openNewParamView = () => setAddingNewParam(true);
    const closeNewParamView = () => setAddingNewParam(false);
    const onSaveNewParam = (param: FunctionParam) => {
        setParameters([...parameters, param]);
        setAddingNewParam(false);
    };
    const onDeleteParam = (paramItem: FunctionParam) =>
        setParameters(parameters.filter((item) => item.id !== paramItem.id));

    useEffect(() => {
        // Getting all function names for function name validation
        existingFunctionNames.current = (syntaxTree as any).members
            .filter((member: any) => STKindChecker.isFunctionDefinition(member))
            .map((member: any) => member.functionName.value);

        if (model && STKindChecker.isFunctionDefinition(model)) {
            // Populating field values if trying to edit
            existingFunctionNames.current = existingFunctionNames.current.filter(
                (name) => name !== model.functionName.value
            );
            setFunctionName(model.functionName.value);
            const editParams: FunctionParam[] = model.functionSignature.parameters
                .filter((param) => STKindChecker.isRequiredParam(param))
                .map((param: any, index) => ({
                    id: index,
                    name: param.paramName.value,
                    type: param.typeName.source.trim(),
                }));
            setParameters(editParams);
        }
    }, [model]);

    let namePosition: NodePosition = { startLine: 0, startColumn: 0, endLine: 0, endColumn: 0 };
    let returnPosition: NodePosition = { startLine: 0, startColumn: 0, endLine: 0, endColumn: 0 };
    let paramPosition: NodePosition = { startLine: 0, startColumn: 0, endLine: 0, endColumn: 0 };

    if (model) {
        namePosition = model.functionName.position;

        if (model?.functionSignature?.returnTypeDesc){
            returnPosition = model?.functionSignature?.returnTypeDesc?.position;
        }else{
            returnPosition = {
                ...model?.functionSignature?.closeParenToken?.position,
                startColumn: model?.functionSignature?.closeParenToken?.position?.startColumn + 1,
            }
        }

        paramPosition = {
            ...model?.functionSignature?.openParenToken?.position,
            startColumn: model?.functionSignature?.openParenToken?.position.startColumn
        };
    } else {
        namePosition.startLine = targetPosition.startLine;
        namePosition.endLine = targetPosition.startLine;

        returnPosition.startLine = targetPosition.startLine;
        returnPosition.endLine = targetPosition.startLine;

        paramPosition = targetPosition;
    }

    const functionNameConfig: VariableNameInputProps = {
        displayName: 'Function Name',
        value: model ? model.functionName.value : '',
        onValueChange: onFunctionNameChange,
        validateExpression: updateFunctionNameValidation,
        position: namePosition,
        isEdit: !!model,
        overrideTemplate: {
            defaultCodeSnippet: 'function () {}',
            targetColumn: 10
        }
    }

    const validateParams = (value: string) => {
        const isParamExist = parameters.some((item) => item.name === value);
        return {
            error: isParamExist,
            message: isParamExist ? `${value} already exists` : "",
        };
    };

    const validateReturnType = (fieldName: string, isInvalid: boolean) => {
        setValidReturnType(!isInvalid);
    };

    const returnTypeConfig: VariableTypeInputProps = {
        displayName: 'Return Type',
        hideLabel: true,
        value: returnType,
        onValueChange: setReturnType,
        validateExpression: validateReturnType,
        position: returnPosition,
        overrideTemplate: model ? {
            defaultCodeSnippet: returnType ? 'returns ' : '',
            targetColumn: returnType ? 9 : 0
        } : {
            defaultCodeSnippet: 'function temp_function() returns  {}',
            targetColumn: 34
        }
    }

    return (
        <FormControl data-testid="log-form" className={formClasses.wizardFormControl}  >
            <FormHeaderSection
                onCancel={onCancel}
                formTitle={"lowcode.develop.configForms.functionForms.title"}
                defaultMessage={"Function"}
            />
            <div className={formClasses.formWrapper}>
                <div className={formClasses.sectionSeparator}>
                    <VariableNameInput {...functionNameConfig} />
                </div>
                <div className={formClasses.sectionSeparator}>
                    <Section title={"Parameters"}>
                        {parameters.map((param) => (
                            <FunctionParamItem
                                key={param.id}
                                functionParam={param}
                                onDelete={onDeleteParam}
                            />
                        ))}
                        {addingNewParam ? (
                            <FunctionParamSegmentEditor
                                id={parameters.length}
                                onCancel={closeNewParamView}
                                onSave={onSaveNewParam}
                                validateParams={validateParams}
                                position={paramPosition}
                                isEdit={!!model}
                                paramCount={parameters.length}
                            />
                        ) : (
                            <span
                                onClick={openNewParamView}
                                className={formClasses.addPropertyBtn}
                            >
                                <AddIcon />
                                <p>Add parameter</p>
                            </span>
                        )}
                    </Section>
                </div>

                <div className={formClasses.sectionSeparator}>
                    <Section title={"Return Type"}>
                        <VariableTypeInput {...returnTypeConfig} />
                    </Section>
                </div>

                <div className={formClasses.wizardBtnHolder}>
                    <SecondaryButton
                        text="Cancel"
                        fullWidth={false}
                        onClick={onCancel}
                    />
                    <PrimaryButton
                        text={"Save"}
                        disabled={disableSaveBtn}
                        fullWidth={false}
                        onClick={handleOnSave}
                    />
                </div>
            </div>
        </FormControl>
    );
}
