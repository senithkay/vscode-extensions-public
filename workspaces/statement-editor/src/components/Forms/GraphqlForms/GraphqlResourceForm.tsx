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
import { completionEditorTypeKinds, EXPR_SCHEME, FILE_SCHEME } from "../../InputEditor/constants";
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

// TODO : refactor resource form functionality
export function GraphqlResourceForm(props: FunctionProps) {
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
    // const [shouldUpdatePath, setShouldUpdatePath] = useState<boolean>(false);
    const [isEditInProgress, setIsEditInProgress] = useState<boolean>(false);

    // States related to syntax diagnostics
    const [currentComponentName, setCurrentComponentName] = useState<string>("");
    const [currentComponentSyntaxDiag, setCurrentComponentSyntaxDiag] = useState<StatementSyntaxDiagnostics[]>(undefined);

    // States related parameters
    const [parameters, setParameters] = useState<FunctionParameter[]>([]);
    const [editingSegmentId, setEditingSegmentId] = useState<number>(-1);
    const [addingNewParam, setAddingNewParam] = useState(false);

    const params = model?.functionSignature?.parameters.filter(param => !STKindChecker.isCommaToken(param));

    const [newlyCreatedConstruct, setNewlyCreatedConstruct] = useState(undefined);

    useEffect(() => {
        if (newlyCreatedConstruct) {
            onReturnTypeChange(newlyCreatedConstruct);
        }
    }, [fullST]);

    // Return type related functions
    const onReturnTypeChange = async (value: string) => {
        setReturnType(value);

        const returnTypeChange = debounce(async () => {
            await handleResourceParamChange(
                model.functionName.value,
                getResourcePath(model.relativeResourcePath),
                generateParameterSectionString(model?.functionSignature?.parameters),
                value,
                model.functionSignature?.returnTypeDesc?.type,
                value
            );
        }, 500);

        returnTypeChange();

    };

    // Open the Add new Parameter view
    const openNewParamView = async () => {
        setCurrentComponentName("Param");
        setAddingNewParam(true);
        setEditingSegmentId(-1);
        const newParams = [...parameters, { type: "string", name: "name" }];
        const parametersStr = getParametersAsString(newParams);
        await handleResourceParamChange(
            model.functionName.value,
            getResourcePath(model.relativeResourcePath),
            parametersStr,
            model.functionSignature?.returnTypeDesc?.type?.source
        );
    };

    // Function called when updating parameter fields (type/name) in the Add new Parameter view
    const onParamChange = async (parameter: FunctionParameter, focusedModel?: STNode, typedInValue?: string) => {
        setCurrentComponentName("Param");
        const newParams = [...parameters, parameter];
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

    const closeNewParamView = () => {
        setAddingNewParam(false);
        setIsEditInProgress(false);
        setEditingSegmentId(-1);
        setCurrentComponentName(undefined);
        setCurrentComponentSyntaxDiag(undefined);
    };

    const onSaveNewParam = (param: FunctionParameter) => {
        setParameters([...parameters, param]);
        setAddingNewParam(false);
        setEditingSegmentId(-1);
    };

    const onDeleteParam = async (paramItem: FunctionParameter) => {
        const newParams = parameters.filter((item) => item.id !== paramItem.id);
        setParameters(newParams);
    };

    // Function called when edit btn clicked an existing parameter
    const handleOnEdit = (funcParam: FunctionParameter) => {
        const id = parameters.findIndex(param => param.id === funcParam.id);
        // Once edit is clicked
        if (id > -1) {
            setEditingSegmentId(id);
        }
        setAddingNewParam(false);
        setIsEditInProgress(true);
    };

    // Function called when update btn clicked an existing parameter
    const handleOnUpdateParam = (param: FunctionParameter) => {
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

    // TODO : check if we can remove this useeffect
    useEffect(() => {
        if (currentComponentName === "") {
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

    // const getResourcePathDiagnostics = () => {
    //     const diagPath = model.relativeResourcePath?.find(
    //         resPath => resPath?.viewState?.diagnosticsInRange?.length > 0);
    //
    //     let resourcePathDiagnostics = [];
    //
    //     if (diagPath && STKindChecker.isResourcePathSegmentParam(diagPath)) {
    //         resourcePathDiagnostics = diagPath?.paramName?.viewState?.diagnosticsInRange && diagPath?.paramName?.viewState?.diagnosticsInRange || [];
    //         resourcePathDiagnostics = diagPath?.typeDescriptor?.viewState?.diagnosticsInRange && diagPath?.typeDescriptor?.viewState?.diagnosticsInRange || [];
    //     } else if (diagPath && STKindChecker.isIdentifierToken(diagPath)) {
    //         resourcePathDiagnostics = diagPath?.viewState?.diagnostics || [];
    //     }
    //
    //     return resourcePathDiagnostics;
    // };

    const handlePathChange = async (value: string) => {
        setResourceName(value);
        // setShouldUpdatePath(false);
        // setResourcePath(value);
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
            // TODO : we could reorder diagnostics here based on the code - "BCE0600" used for invalid token (if reserved word)
            return currentComponentSyntaxDiag;
        } else {
            const diagPath = model.relativeResourcePath?.find(
                resPath => resPath?.viewState?.diagnosticsInRange?.length > 0);

            let resourcePathDiagnostics = [];

            if (diagPath && STKindChecker.isResourcePathSegmentParam(diagPath)) {
                // TODO : check the logic here
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
                            {addingNewParam ? (
                                <ParameterEditor
                                    param={params[parameters.length] as (DefaultableParam | IncludedRecordParam |
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
                    && !(currentComponentSyntaxDiag?.length > 0)}
                />
            </>
        );
    };


    return (
        <FormControl data-testid="graphql-resource-form" className={connectorClasses.wizardFormControlExtended}>
            <FormHeaderSection
                onCancel={onCancel}
                formTitle={"Configure GraphQL Query"}
                defaultMessage={"Configure GraphQL Query"}
            />
            {formContent()}
        </FormControl>
    );
}
