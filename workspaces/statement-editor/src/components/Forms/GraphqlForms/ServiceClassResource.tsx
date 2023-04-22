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

// tslint:disable: jsx-no-multiline-js jsx-no-lambda
import React, { useContext, useEffect, useState } from "react";

import { Button, Divider, FormControl } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import { LiteTextField, TypeBrowser } from "@wso2-enterprise/ballerina-expression-editor";
import {
    createResource,
    getSource,
    updateResourceSignature
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    ConfigPanelSection,
    dynamicConnectorStyles as connectorStyles, FormActionButtons,
    FormHeaderSection,
} from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import {
    DefaultableParam,
    IncludedRecordParam, RequiredParam,
    ResourceAccessorDefinition, RestParam,
    STKindChecker,
    STNode
} from "@wso2-enterprise/syntax-tree";
import debounce from "lodash.debounce";

import { StatementSyntaxDiagnostics, SuggestionItem } from "../../../models/definitions";
import { FormEditorContext } from "../../../store/form-editor-context";
import { getUpdatedSource } from "../../../utils";
import { getPartialSTForModuleMembers } from "../../../utils/ls-utils";
import { completionEditorTypeKinds } from "../../InputEditor/constants";
import { FieldTitle } from "../components/FieldTitle/fieldTitle";
import {
    createNewConstruct,
    generateParameterSectionString,
    getResourcePath
} from "../ResourceForm/util";

import { ParameterEditor } from "./ParameterEditor/ParameterEditor";
import { FunctionParameter, ParameterField } from "./ParameterEditor/ParameterField";
import { getFilteredCompletions, getParametersAsString } from "./utils";

export interface FunctionProps {
    model: ResourceAccessorDefinition;
    completions: SuggestionItem[];
}


export function ServiceClassResourceForm(props: FunctionProps) {
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
    const [returnType, setReturnType] = useState<string>(model ? model.functionSignature?.returnTypeDesc?.type?.source?.trim() : "");
    const [resourceName, setResourceName] = useState<string>(model ? getResourcePath(model?.relativeResourcePath).trim() : "");
    const [isEditInProgress, setIsEditInProgress] = useState<boolean>(false);

    // States related to syntax diagnostics
    const [currentComponentName, setCurrentComponentName] = useState<string>("");
    const [currentComponentSyntaxDiag, setCurrentComponentSyntaxDiag] = useState<StatementSyntaxDiagnostics[]>(undefined);

    // States related parameters
    const [parameters, setParameters] = useState<FunctionParameter[]>([]);
    const [editingSegmentId, setEditingSegmentId] = useState<number>(-1);
    const [addingNewParam, setAddingNewParam] = useState(false);
    const [addingBeforeDefaultableParam, setAddingBeforeDefaultableParam] = useState(false);

    const params = model?.functionSignature?.parameters.filter(param => !STKindChecker.isCommaToken(param));

    const [newlyCreatedConstruct, setNewlyCreatedConstruct] = useState(undefined);

    const [parametersBeforeParamChange, setParamsBeforeParamChange] = useState<FunctionParameter[]>([]);

    useEffect(() => {
        if (newlyCreatedConstruct) {
            onReturnTypeChange(newlyCreatedConstruct);
        }
    }, [fullST]);

    // Return type related functions
    const onReturnTypeChange = async (value: string) => {
        const formattedValue =  value.replace(/\s*\|\s*/g, '|');
        setReturnType(formattedValue);

        const returnTypeChange = debounce(async () => {
            await handleResourceParamChange(
                model.functionName.value,
                getResourcePath(model.relativeResourcePath),
                generateParameterSectionString(model?.functionSignature?.parameters),
                formattedValue,
                model.functionSignature?.returnTypeDesc?.type,
                formattedValue
            );
        }, 500);

        returnTypeChange();

    };

    // Open the Add new Parameter view
    const openNewParamView = async () => {
        setParamsBeforeParamChange(parameters);
        setCurrentComponentName("Param");
        let editingParamId = params?.length === 0 ? 0 : params?.length;
        const newParamsList = [...parameters, { type: "string", name: "name" }];
        let parametersStr = getParametersAsString(newParamsList);
        const lastParamIndex = params.findIndex(param => STKindChecker.isRestParam(param) || STKindChecker.isDefaultableParam(param));
        if (lastParamIndex !== -1) {
            editingParamId = lastParamIndex;
            parametersStr = params.reduce((prev, current, currentIndex) => {
                const previousParams = prev.length === 0 ? `${prev}` : `${prev},`;
                return currentIndex === lastParamIndex ?
                    `${previousParams} string name, ${current.source ? current.source : current.value}` :
                    `${previousParams} ${current.source ? current.source : current.value}`
            }, '');

            setAddingBeforeDefaultableParam(true);
        } else {

            setAddingNewParam(true);
        }

        await handleResourceParamChange(
            model.functionName.value,
            getResourcePath(model.relativeResourcePath),
            parametersStr,
            model.functionSignature?.returnTypeDesc?.type?.source
        );
        setEditingSegmentId(editingParamId);
    };

    // Function called when updating parameter fields (type/name) in the Add new Parameter view
    const onParamChange = async (parameter: FunctionParameter, focusedModel?: STNode, typedInValue?: string) => {
        setCurrentComponentName("Param");
        let newParams = [...parameters];
        if (addingBeforeDefaultableParam) {
            newParams[editingSegmentId] = parameter;
        } else {
            newParams = [...parameters, parameter];
        }
        const parametersStr = getParametersAsString(newParams);
        await handleResourceParamChange(
            model.functionName.value,
            getResourcePath(model.relativeResourcePath),
            parametersStr,
            model.functionSignature?.returnTypeDesc?.type?.source,
            focusedModel,
            typedInValue
        );
    };

    // Function called when updating parameter fields (type/name) in already existing parameters
    const onChangeExistingParameter = async (parameter: FunctionParameter, focusedModel?: STNode, typedInValue?: string) => {
        setCurrentComponentName("Param");
        const newParams = [...parameters];
        newParams[parameter.id] = parameter;
        const parametersStr = getParametersAsString(newParams);
        await handleResourceParamChange(
            model.functionName.value,
            getResourcePath(model.relativeResourcePath),
            parametersStr,
            model.functionSignature?.returnTypeDesc?.type?.source,
            focusedModel,
            typedInValue
        );
    };

    const handleOnSave = () => {
        const parametersStr = getParametersAsString(parameters);
        if (isEdit) {
            applyModifications([
                updateResourceSignature(
                    model.functionName.value,
                    getResourcePath(model.relativeResourcePath),
                    parametersStr,
                    model.functionSignature?.returnTypeDesc?.type?.source,
                    targetPosition)
            ]);
        } else {
            applyModifications([
                createResource(
                    model.functionName.value,
                    getResourcePath(model.relativeResourcePath),
                    parametersStr,
                    model.functionSignature?.returnTypeDesc?.type?.source,
                    targetPosition
                )
            ]);
        }

        onCancel();
    };

    const closeNewParamView = async () => {
        const parametersStr = getParametersAsString(parametersBeforeParamChange);
        await handleResourceParamChange(
            model.functionName.value,
            getResourcePath(model.relativeResourcePath),
            parametersStr,
            model.functionSignature?.returnTypeDesc?.type?.source
        );
        setAddingNewParam(false);
        setAddingBeforeDefaultableParam(false);
        setIsEditInProgress(false);
        setEditingSegmentId(-1);
        setCurrentComponentName(undefined);
        setCurrentComponentSyntaxDiag(undefined);
    };

    const onSaveNewParam = (param: FunctionParameter) => {
        if (addingBeforeDefaultableParam) {
            if (editingSegmentId > -1) {
                parameters[editingSegmentId] = param;
                setParameters(parameters);
            }
        } else {
            setParameters([...parameters, param]);
        }
        setAddingNewParam(false);
        setAddingBeforeDefaultableParam(false);
        setEditingSegmentId(-1);
        setIsEditInProgress(false);
    };

    const onDeleteParam = async (paramItem: FunctionParameter) => {
        const newParams = parameters.filter((item) => item.id !== paramItem.id);
        setParameters(newParams);
    };

    // Function called when edit btn clicked an existing parameter
    const handleOnEdit = (funcParam: FunctionParameter) => {
        setParamsBeforeParamChange(parameters);
        const id = parameters.findIndex(param => param.id === funcParam.id);
        // Once edit is clicked
        if (id > -1) {
            setEditingSegmentId(id);
        }
        setIsEditInProgress(true);
    };

    // Function called when update btn clicked an existing parameter
    const handleOnUpdateParam = (param: FunctionParameter) => {
        const id = param.id;
        if (id > -1) {
            parameters[id] = param;
            setParameters(parameters);
        }
        setEditingSegmentId(-1);
        setIsEditInProgress(false);
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
            } else if (editingSegmentId === index && !addingNewParam && !addingBeforeDefaultableParam) {
                paramElements.push(
                    <ParameterEditor
                        param={params[editingSegmentId] as (DefaultableParam | IncludedRecordParam | RequiredParam |
                            RestParam)}
                        id={editingSegmentId}
                        syntaxDiag={currentComponentSyntaxDiag}
                        onCancel={closeNewParamView}
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
        if (currentComponentName === "" || addingBeforeDefaultableParam) {
            const editParams: FunctionParameter[] = model?.functionSignature.parameters
                .filter((param) => !STKindChecker.isCommaToken(param))
                .map((param: any, index) => ({
                    id: index,
                    name: param.paramName.value,
                    type: param.typeName.source.trim(),
                    defaultValue: param.expression ? param.expression.source.trim() : ""
                }));
            setParameters(editParams);
        }
    }, [model]);

    const handlePathChange = async (value: string) => {
        setResourceName(value);
        await handleResourceParamChange(
            model.functionName.value,
            value,
            generateParameterSectionString(model?.functionSignature?.parameters),
            model.functionSignature?.returnTypeDesc?.type?.source,
        );
    };

    const onPathFocus = () => {
        setCurrentComponentName("Path");
    };

    const handleResourceParamChange = async (
        resMethod: string,
        pathStr: string,
        paramStr: string,
        returnStr: string,
        stModel?: STNode,
        currentValue?: string) => {
        const pathString = pathStr ? pathStr : "";
        const codeSnippet = getSource(
            updateResourceSignature(resMethod, pathString, paramStr, returnStr, targetPosition));
        const position = model ? ({
            startLine: model.functionName.position.startLine - 1,
            startColumn: model.functionName.position.startColumn,
            endLine: model.functionSignature.position.endLine - 1,
            endColumn: model.functionSignature.position.endColumn
        }) : targetPosition;
        const updatedContent = getUpdatedSource(codeSnippet, model?.source, position, undefined,
            true);
        const partialST = await getPartialSTForModuleMembers(
            { codeSnippet: updatedContent.trim() }, getLangClient, true
        );

        if (!partialST.syntaxDiagnostics.length) {
            onChange(updatedContent, partialST, undefined, { model: stModel }, currentValue, completionEditorTypeKinds, 0,
                { startLine: -1, startColumn: -4 });

            setCurrentComponentSyntaxDiag(undefined);
        } else {
            setCurrentComponentSyntaxDiag(partialST.syntaxDiagnostics);
        }

    };

    const createConstruct = (newCodeSnippet: string) => {
        if (newCodeSnippet) {
            createNewConstruct(newCodeSnippet, fullST, applyModifications)
            setNewlyCreatedConstruct(returnType);
        }
    }

    const getPathDiagnostic = () => {
        if (currentComponentSyntaxDiag){
            return currentComponentSyntaxDiag;
        } else {
            const diagPath = model.relativeResourcePath?.find(
                resPath => resPath?.viewState?.diagnosticsInRange?.length > 0);

            let resourcePathDiagnostics = [];

            if (diagPath && STKindChecker.isResourcePathSegmentParam(diagPath)) {
                resourcePathDiagnostics = diagPath?.paramName?.viewState?.diagnosticsInRange && diagPath?.paramName?.viewState?.diagnosticsInRange || [];
                resourcePathDiagnostics = diagPath?.typeDescriptor?.viewState?.diagnosticsInRange && diagPath?.typeDescriptor?.viewState?.diagnosticsInRange || [];
            } else if (diagPath && STKindChecker.isIdentifierToken(diagPath)) {
                resourcePathDiagnostics = diagPath?.viewState?.diagnostics;
            }

            return resourcePathDiagnostics;
        }
    }

    const formContent = () => {
        return (
            <>
                <div className={connectorClasses.formContentWrapper}>
                    <div className={connectorClasses.formNameWrapper}>
                        <FieldTitle title="Path" optional={false}/>
                        <LiteTextField
                            value={resourceName}
                            onChange={handlePathChange}
                            onFocus={onPathFocus}
                            isLoading={currentComponentName !== "Path" && isEditInProgress}
                            diagnostics={(currentComponentName === "Path")
                            && getPathDiagnostic()}
                        />
                        <Divider className={connectorClasses.sectionSeperatorHR}/>
                        <ConfigPanelSection title={"Parameters"}>
                            {paramElements}
                            {addingNewParam || addingBeforeDefaultableParam ? (
                                <ParameterEditor
                                    param={params[editingSegmentId] as (DefaultableParam | IncludedRecordParam |
                                        RequiredParam | RestParam)}
                                    id={parameters.length}
                                    syntaxDiag={currentComponentSyntaxDiag}
                                    onCancel={closeNewParamView}
                                    onChange={onParamChange}
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
                            diagnostics={
                                currentComponentSyntaxDiag?.length > 0 ?
                                    currentComponentSyntaxDiag :
                                    model?.functionSignature?.returnTypeDesc?.viewState?.diagnosticsInRange
                            }
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
                    && !(currentComponentSyntaxDiag?.length > 0)}
                />
            </>
        );
    };


    return (
        <FormControl data-testid="graphql-service-resource-form" className={connectorClasses.wizardFormControlExtended}>
            <FormHeaderSection
                onCancel={onCancel}
                formTitle={"Configure Service Class Resource"}
                defaultMessage={"Configure Service Class Resource"}
            />
            {formContent()}
        </FormControl>
    );
}
