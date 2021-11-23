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

import { Box, FormControl, Typography } from "@material-ui/core";
import { FormHeaderSection, PrimaryButton, SecondaryButton, STModification } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { FunctionDefinition, NodePosition, STKindChecker } from "@wso2-enterprise/syntax-tree";

import { AddIcon, FunctionIcon } from "../../../../../assets/icons";
import { Section } from "../../../../../components/ConfigPanel";
import { useDiagramContext } from "../../../../../Contexts/Diagram";
import {
    createFunctionSignature,
    updateFunctionSignature,
} from "../../../../utils/modification-util";
import {
    QueryParam,
    ReturnType,
} from "../../../LowCodeDiagram/Components/DialogBoxes/DropDown/ApiConfigureWizard/types";
import { functionParamTypes } from "../../../LowCodeDiagram/Components/DialogBoxes/DropDown/ApiConfigureWizard/util";
import { VariableNameInput, VariableNameInputProps } from "../Components/VariableNameInput";
import { QueryParamItem as FunctionParamItem } from "../ResourceConfigForm/ApiConfigureWizard/components/queryParamEditor/queryParamItem";
import { QueryParamSegmentEditor as FunctionParamSegmentEditor } from "../ResourceConfigForm/ApiConfigureWizard/components/queryParamEditor/segmentEditor";
import { ReturnTypeItem } from "../ResourceConfigForm/ApiConfigureWizard/components/ReturnTypeEditor/ReturnTypeItem";
import { ReturnTypeSegmentEditor } from "../ResourceConfigForm/ApiConfigureWizard/components/ReturnTypeEditor/SegmentEditor";
import { functionReturnTypes } from "../ResourceConfigForm/ApiConfigureWizard/util";
import { wizardStyles as useFormStyles } from "../style";

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
    const [parameters, setParameters] = useState<QueryParam[]>([]);
    const [returnTypes, setReturnTypes] = useState<ReturnType[]>([]);
    const [addingNewParam, setAddingNewParam] = useState(false);
    const [addingNewReturnType, setAddingNewReturnType] = useState(false);
    const [isFunctionNameValid, setIsFunctionNameValid] = useState(false);

    const {
        props: { syntaxTree },
        api: {
            code: { modifyDiagram },
        },
    } = useDiagramContext();
    const existingFunctionNames = useRef([]);
    const disableSaveBtn = !(functionName.length > 0) || !isFunctionNameValid;

    const handleOnSave = () => {
        const parametersStr = parameters
            .map((item) => `${item.type} ${item.name}`)
            .join(",");
        const returnType = returnTypes
            .map((item) => `${item.type}${item.isOptional ? "?" : ""}`)
            .join("|");
        let returnTypeStr = returnType ? `returns ${returnType}` : "";



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
            // If none of the types are optional, append `|error?` or `|()` to the return types
            if (returnTypeStr && returnTypes.every((item) => !item.isOptional)) {
                // if `error` type is selected as one of mandatory return types, set return type as `..|error|()` else set return type as `..|error?`
                const containsReturnType = !!returnTypes.find(item => item.type === 'error' && !item.isOptional);
                returnTypeStr = containsReturnType ? `${returnTypeStr}|()` : `${returnTypeStr}|error?`;
            }

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
    const onSaveNewParam = (param: QueryParam) => {
        setParameters([...parameters, param]);
        setAddingNewParam(false);
    };
    const onDeleteParam = (paramItem: QueryParam) =>
        setParameters(parameters.filter((item) => item.id !== paramItem.id));

    // Return type related functions
    const openNewReturnTypeView = () => setAddingNewReturnType(true);
    const closeNewReturnTypeView = () => setAddingNewReturnType(false);
    const onDeleteReturnType = (returnItem: ReturnType) =>
        setReturnTypes(returnTypes.filter((item) => item.id !== returnItem.id));
    const onSaveNewReturnType = (item: ReturnType) => {
        setReturnTypes([...returnTypes, item]);
        setAddingNewReturnType(false);
    };

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
            const editParams: QueryParam[] = model.functionSignature.parameters
                .filter((param) => STKindChecker.isRequiredParam(param))
                .map((param: any, index) => ({
                    id: index,
                    name: param.paramName.value,
                    type: param.typeName.name.value,
                }));
            setParameters(editParams);

            const returnArr = model?.functionSignature?.returnTypeDesc?.type?.source.split(
                "|"
            );
            if (returnArr) {
                const returnParams: ReturnType[] = returnArr.map((item, index) => ({
                    id: index,
                    isOptional: item.trim().endsWith("?"),
                    type: item.trim().replace("?", ""),
                }));
                setReturnTypes(returnParams);
            }
        }
    }, [model]);

    let namePosition: NodePosition = { startLine: 0, startColumn: 0, endLine: 0, endColumn: 0 }

    if (model) {
        namePosition = model.functionName.position;
    } else {
        namePosition.startLine = targetPosition.startLine;
        namePosition.endLine = targetPosition.startLine;
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
                                queryParam={param}
                                onDelete={onDeleteParam}
                            />
                        ))}
                        {addingNewParam ? (
                            <FunctionParamSegmentEditor
                                id={parameters.length}
                                onCancel={closeNewParamView}
                                types={functionParamTypes}
                                onSave={onSaveNewParam}
                                validateParams={validateParams}
                            // params={parameters}
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
                        {returnTypes.map((returnType) => (
                            <ReturnTypeItem
                                key={returnType.id}
                                returnType={returnType}
                                onDelete={onDeleteReturnType}
                            />
                        ))}
                        {addingNewReturnType ? (
                            <ReturnTypeSegmentEditor
                                id={returnTypes.length}
                                showDefaultError={false}
                                onCancel={closeNewReturnTypeView}
                                onSave={onSaveNewReturnType}
                                returnTypesValues={functionReturnTypes}
                            />
                        ) : (
                            <span
                                onClick={openNewReturnTypeView}
                                className={formClasses.addPropertyBtn}
                            >
                                <AddIcon />
                                <p>Add return type</p>
                            </span>
                        )}
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
