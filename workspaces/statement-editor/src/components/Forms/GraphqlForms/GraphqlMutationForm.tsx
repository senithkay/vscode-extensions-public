/*
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
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
import React, { useContext, useEffect, useState } from "react";

import { Button, Divider, FormControl } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import { LiteExpressionEditor, LiteTextField, TypeBrowser } from "@wso2-enterprise/ballerina-expression-editor";
import {
    createRemoteFunction,
    getSource, updateRemoteFunctionSignature,
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    ConfigPanelSection,
    dynamicConnectorStyles as connectorStyles, FormActionButtons,
    FormHeaderSection,
} from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import {
    DefaultableParam,
    IncludedRecordParam, ObjectMethodDefinition, RequiredParam,
    RestParam,
    STKindChecker,
    STNode
} from "@wso2-enterprise/syntax-tree";

import { StatementSyntaxDiagnostics, SuggestionItem } from "../../../models/definitions";
import { FormEditorContext } from "../../../store/form-editor-context";
import { getUpdatedSource } from "../../../utils";
import { getPartialSTForModuleMembers } from "../../../utils/ls-utils";
import { completionEditorTypeKinds } from "../../InputEditor/constants";
import { FieldTitle } from "../components/FieldTitle/fieldTitle";
import { FunctionParam } from "../FunctionForm/FunctionParamEditor/FunctionParamItem";
import { createNewConstruct, generateParameterSectionString } from "../ResourceForm/util";

import { ParameterEditor } from "./ParameterEditor/ParameterEditor";
import { FunctionParameter, ParameterField } from "./ParameterEditor/ParameterField";
import { getFilteredCompletions, getParametersAsString } from "./utils";

export interface FunctionProps {
    model: ObjectMethodDefinition;
    completions: SuggestionItem[];
}

export function GraphqlMutationForm(props: FunctionProps) {
    const { model, completions } = props;

    const {
        targetPosition,
        isEdit,
        onChange,
        applyModifications,
        onCancel,
        getLangClient,
        fullST
    } = useContext(FormEditorContext);

    const connectorClasses = connectorStyles();

    // States related to component model
    const [functionName, setFunctionName] = useState<string>(model ? model.functionName.value : "");
    const [returnType, setReturnType] = useState<string>(model ? model.functionSignature?.returnTypeDesc?.type?.source?.trim() : "");
    const [isEditInProgress, setIsEditInProgress] = useState<boolean>(false);

    // States related to syntax diagnostics
    const [currentComponentName, setCurrentComponentName] = useState<string>("");
    const [currentComponentSyntaxDiag, setCurrentComponentSyntaxDiag] = useState<StatementSyntaxDiagnostics[]>(undefined);

    // States related parameters
    const [parameters, setParameters] = useState<FunctionParam[]>([]);
    const [editingSegmentId, setEditingSegmentId] = useState<number>(-1);
    const [addingNewParam, setAddingNewParam] = useState(false);

    const params = model?.functionSignature?.parameters.filter(param => !STKindChecker.isCommaToken(param));

    const [newlyCreatedConstruct, setNewlyCreatedConstruct] = useState(undefined);

    useEffect(() => {
        if (newlyCreatedConstruct) {
            onReturnTypeChange(newlyCreatedConstruct);
        }
    }, [fullST]);

    const createConstruct = (newCodeSnippet: string) => {
        if (newCodeSnippet) {
            createNewConstruct(newCodeSnippet, fullST, applyModifications)
            setNewlyCreatedConstruct(returnType);
        }
    }

    // Return type related functions
    const onReturnTypeChange = (value: string) => {
        setReturnType(value);

        handleRemoteMethodDataChange(
            model.functionName.value,
            generateParameterSectionString(model?.functionSignature?.parameters),
            value,
            model.functionSignature?.returnTypeDesc?.type,
            value
        );
    };

    // Param related functions
    const openNewParamView = async () => {
        setCurrentComponentName("Param");
        setAddingNewParam(true);
        setEditingSegmentId(-1);
        const newParams = [...parameters, { type: "string", name: "name" }];
        const parametersStr = getParametersAsString(newParams)
        await handleRemoteMethodDataChange(
            model.functionName.value,
            parametersStr,
            model.functionSignature?.returnTypeDesc?.type?.source
        );
    };

    const onNewParamChange = async (parameter: FunctionParameter, focusedModel?: STNode, typedInValue?: string) => {
        setCurrentComponentName("Param");
        const newParams = [...parameters, parameter];
        const parametersStr = getParametersAsString(newParams)
        await handleRemoteMethodDataChange(
            model.functionName.value,
            parametersStr,
            model.functionSignature?.returnTypeDesc?.type?.source,
            focusedModel,
            typedInValue
        );
    };

    const onChangeExistingParameter = async (parameter: FunctionParameter, focusedModel?: STNode, typedInValue?: string) => {
        setCurrentComponentName("Param");
        const newParams = [...parameters];
        newParams[parameter.id] = parameter;
        const parametersStr = getParametersAsString(newParams)
        await handleRemoteMethodDataChange(
            model.functionName.value,
            parametersStr,
            model.functionSignature?.returnTypeDesc?.type?.source,
            focusedModel,
            typedInValue
        );
    };

    const handleOnSave = () => {
        const parametersStr = parameters ? parameters.map((item) => `${item.type} ${item.name}`).join(", ") : "";
        if (isEdit) {
            applyModifications([
                updateRemoteFunctionSignature(
                    functionName,
                    parametersStr,
                    returnType,
                    targetPosition)
            ]);
        } else {
            applyModifications([
                createRemoteFunction(
                    functionName,
                    parametersStr,
                    returnType,
                    targetPosition
                )
            ]);
        }

        onCancel();
    };

    const closeParamView = () => {
        setAddingNewParam(false);
        setIsEditInProgress(false);
        setEditingSegmentId(-1);
        setCurrentComponentName(undefined);
        setCurrentComponentSyntaxDiag(undefined);
    };

    const onSaveNewParam = (param: FunctionParam) => {
        setParameters([...parameters, param]);
        setAddingNewParam(false);
        setEditingSegmentId(-1);
    };

    const onDeleteParam = async (paramItem: FunctionParam) => {
        const newParams = parameters.filter((item) => item.id !== paramItem.id);
        setParameters(newParams);
    };

    const handleOnEdit = (funcParam: FunctionParam) => {
        const id = parameters.findIndex(param => param.id === funcParam.id);
        // Once edit is clicked
        if (id > -1) {
            setEditingSegmentId(id);
        }
        setAddingNewParam(false);
        setIsEditInProgress(true);
    };

    const handleOnUpdateParam = (param: FunctionParam) => {
        const id = param.id;
        if (id > -1) {
            parameters[id] = param;
            setParameters(parameters);
        }
        setAddingNewParam(false);
        setEditingSegmentId(-1);
    };

    const paramElements: React.ReactElement[] = [];
    parameters?.forEach((param, index) => {
        if (param.name) {
            if (editingSegmentId !== index) {
                paramElements.push(
                    <ParameterField
                        param={param}
                        readonly={addingNewParam || (currentComponentSyntaxDiag?.length > 0)}
                        onDelete={onDeleteParam}
                        onEditClick={handleOnEdit}
                    />
                );
            } else if (editingSegmentId === index) {
                paramElements.push(
                    <ParameterEditor
                        param={params[editingSegmentId] as (DefaultableParam | IncludedRecordParam | RequiredParam |
                            RestParam)}
                        id={editingSegmentId}
                        syntaxDiag={currentComponentSyntaxDiag}
                        onCancel={closeParamView}
                        onSave={handleOnUpdateParam}
                        onChange={onChangeExistingParameter}
                        isEdit={true}
                        completions={getFilteredCompletions(completions)}
                    />
                );
            }
        }
    });

    useEffect(() => {
        setFunctionName(model ? model.functionName.value : "");

        if (currentComponentName === "") {
            const editParams: FunctionParam[] = model?.functionSignature.parameters
                .filter((param) => !STKindChecker.isCommaToken(param))
                .map((param: any, index) => ({
                    id: index,
                    name: param.paramName.value,
                    type: param.typeName.source.trim(),
                }));
            setParameters(editParams);
        }
    }, [model]);


    const handleNameChange = async (value: string) => {
        setFunctionName(value);
        await handleRemoteMethodDataChange(
            value,
            generateParameterSectionString(model?.functionSignature?.parameters),
            model.functionSignature?.returnTypeDesc?.type?.source,
        );
    };

    const onNameFocus = () => {
        setCurrentComponentName("MethodName");
    };

    const handleRemoteMethodDataChange = async (funcName: string, paramStr: string, returnStr: string,
                                                stModel?: STNode, currentValue?: string) => {

        const codeSnippet = getSource(
            updateRemoteFunctionSignature(funcName, paramStr, returnStr, targetPosition));
        const position = model ? ({
            startLine: model.functionName.position.startLine - 1,
            startColumn: model.functionName.position.startColumn,
            endLine: model.functionSignature.position.endLine - 1,
            endColumn: model.functionSignature.position.endColumn
        }) : targetPosition;
        const updatedContent = getUpdatedSource(codeSnippet, model?.source, position, undefined,
            true);
        const partialST = await getPartialSTForModuleMembers({ codeSnippet: updatedContent.trim() },
            getLangClient, true);

        if (!partialST.syntaxDiagnostics.length) {
            onChange(updatedContent, partialST, undefined, { model: stModel }, currentValue, completionEditorTypeKinds, 0,
                { startLine: -1, startColumn: -4 });

            setCurrentComponentSyntaxDiag(undefined);
        } else {
            setCurrentComponentSyntaxDiag(partialST.syntaxDiagnostics);
        }
    };

    const formContent = () => {
        return (
            <>
                <div className={connectorClasses.formContentWrapper}>
                    <div className={connectorClasses.formNameWrapper}>
                        <FieldTitle title="Name" optional={false}/>
                        <LiteTextField
                            value={functionName}
                            onChange={handleNameChange}
                            onFocus={onNameFocus}
                            isLoading={currentComponentName !== "MethodName" && isEditInProgress}
                            diagnostics={
                                (currentComponentName === "MethodName" && currentComponentSyntaxDiag)
                                || model?.functionName?.viewState?.diagnosticsInRange
                            }
                        />
                        <Divider className={connectorClasses.sectionSeperatorHR}/>
                        <ConfigPanelSection title={"Parameters"}>
                            {paramElements}
                            {addingNewParam ? (
                                <ParameterEditor
                                    param={params[parameters.length] as (DefaultableParam | IncludedRecordParam |
                                        RequiredParam | RestParam)}
                                    id={parameters.length}
                                    syntaxDiag={currentComponentSyntaxDiag}
                                    onCancel={closeParamView}
                                    onChange={onNewParamChange}
                                    onSave={onSaveNewParam}
                                    isEdit={false}
                                    completions={getFilteredCompletions(completions)}
                                />
                            ) : (
                                <Button
                                    data-test-id="param-add-button"
                                    onClick={openNewParamView}
                                    className={connectorClasses.addParameterBtn}
                                    startIcon={<AddIcon/>}
                                    color="primary"
                                    disabled={currentComponentSyntaxDiag?.length > 0}
                                >
                                    Add parameter
                                </Button>
                            )}
                        </ConfigPanelSection>
                        <Divider className={connectorClasses.sectionSeperatorHR}/>
                        <FieldTitle title="Return Type" optional={false}/>
                        <TypeBrowser
                            type={returnType}
                            onChange={onReturnTypeChange}
                            isLoading={false}
                            recordCompletions={getFilteredCompletions(completions)}
                            createNew={createConstruct}
                            diagnostics={model?.functionSignature?.returnTypeDesc?.viewState?.diagnosticsInRange}
                            isGraphqlForm={true}
                        />
                    </div>
                </div>
                <FormActionButtons
                    cancelBtnText="Cancel"
                    cancelBtn={true}
                    saveBtnText="Save"
                    onSave={handleOnSave}
                    onCancel={onCancel}
                    validForm={!(model?.functionSignature?.viewState?.diagnosticsInRange?.length > 0)
                    && !(model?.functionName?.viewState?.diagnosticsInRange?.length > 0)
                    && !(currentComponentSyntaxDiag?.length > 0)}
                />
            </>
        );
    };


    return (
        <FormControl data-testid="graphql-resource-form" className={connectorClasses.wizardFormControlExtended}>
            <FormHeaderSection
                onCancel={onCancel}
                formTitle={"Configure GraphQL Mutation"}
                defaultMessage={"Configure GraphQL Mutation"}
            />
            {formContent()}
        </FormControl>
    );
}
