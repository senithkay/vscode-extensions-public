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

import { Button, Divider, FormControl, TextField } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import { LiteExpressionEditor, TypeBrowser } from "@wso2-enterprise/ballerina-expression-editor";
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
    createNewRecord,
    generateParameterSectionString,
    getParamString,
    getResourcePath
} from "../ResourceForm/util";

import { ParameterEditor } from "./ParameterEditor/ParameterEditor";
import { FunctionParameter, ParameterField } from "./ParameterEditor/ParameterField";

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
        syntaxTree,
        fullST
    } = useContext(FormEditorContext);

    const connectorClasses = connectorStyles();

    // States related to component model
    const [returnType, setReturnType] = useState<string>(model ? model.functionSignature?.returnTypeDesc?.type?.source?.trim() : "");
    const [shouldUpdatePath, setShouldUpdatePath] = useState<boolean>(false);
    const [isEditInProgress, setIsEditInProgress] = useState<boolean>(false);

    // States related to syntax diagnostics
    const [currentComponentName, setCurrentComponentName] = useState<string>("");
    const [currentComponentSyntaxDiag, setCurrentComponentSyntaxDiag] = useState<StatementSyntaxDiagnostics[]>(undefined);
    const [currentComponentCompletions, setCurrentComponentCompletions] = useState<SuggestionItem[]>(undefined);

    // States related parameters
    const [parameters, setParameters] = useState<FunctionParameter[]>([]);
    const [editingSegmentId, setEditingSegmentId] = useState<number>(-1);
    const [addingNewParam, setAddingNewParam] = useState(false);

    const params = model?.functionSignature?.parameters.filter(param => !STKindChecker.isCommaToken(param));

    // TODO : These logic will be replaced with the record/class options
    const [newlyCreatedRecord, setNewlyCreatedRecord] = useState(undefined);

    // When a type is created and full ST is updated update the onChange to remove diagnostics
    useEffect(() => {
        if (newlyCreatedRecord) {
            onReturnTypeChange(newlyCreatedRecord);
        }
    }, [fullST]);

    // Return type related functions
    const onReturnTypeChange = async (value: string) => {
        setReturnType(value);

        const returnTypeChange =  debounce(async () => {
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

    const onReturnFocus = async () => {
        setCurrentComponentCompletions([]);
        setCurrentComponentName("Return");
    };

    // Param related functions
    const openNewParamView = async () => {
        setCurrentComponentName("Param");
        setAddingNewParam(true);
        setEditingSegmentId(-1);
        const newParams = [...parameters, { type: "string", name: "name" }];
        const parametersStr = newParams
            .map((item: FunctionParameter) => `${item.type} ${item.name} ${item.defaultValue ? `= ${item.defaultValue}` : ""}`)
            .join(", ");
        await handleResourceParamChange(
            model.functionName.value,
            getResourcePath(model.relativeResourcePath),
            parametersStr,
            model.functionSignature?.returnTypeDesc?.type?.source
        );
    };

    const onParamChange = async (param: FunctionParameter) => {
        setCurrentComponentName("Param");
        const newParams = [...parameters, param];
        const parametersStr = newParams
            .map((item: FunctionParameter) => `${item.type} ${item.name} ${item.defaultValue ? `= ${item.defaultValue}` : ""}`)
            .join(", ");
        await handleResourceParamChange(
            model.functionName.value,
            getResourcePath(model.relativeResourcePath),
            parametersStr,
            model.functionSignature?.returnTypeDesc?.type?.source
        );
    };

    const onUpdateParamChange = async (param: FunctionParameter) => {
        setCurrentComponentName("Param");
        const newParams = [...parameters];
        newParams[param.id] = param;
        const parametersStr = newParams
            .map((item: FunctionParameter) => `${item.type} ${item.name} ${item.defaultValue ? `= ${item.defaultValue}` : ""}`)
            .join(", ");
        await handleResourceParamChange(
            model.functionName.value,
            getResourcePath(model.relativeResourcePath),
            parametersStr,
            model.functionSignature?.returnTypeDesc?.type?.source
        );
    };

    const handleOnSave = () => {
        const parametersStr = parameters
            .map((item: FunctionParameter) => `${item.type} ${item.name} ${item.defaultValue ? `= ${item.defaultValue}` : ""}`)
            .join(", ");
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

    const handleOnEdit = (funcParam: FunctionParameter) => {
        const id = parameters.findIndex(param => param.id === funcParam.id);
        // Once edit is clicked
        if (id > -1) {
            setEditingSegmentId(id);
        }
        setAddingNewParam(false);
        setIsEditInProgress(true);
    };

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
                        onUpdate={handleOnUpdateParam}
                        onChange={onUpdateParamChange}
                        isEdit={true}
                    />
                );
            }
        }
    });

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

        if (completions) {
            setCurrentComponentCompletions(completions);
        }
    }, [model, completions]);

    const getResourcePathDiagnostics = () => {
        const diagPath = model.relativeResourcePath?.find(
            resPath => resPath?.viewState?.diagnosticsInRange?.length > 0);

        let resourcePathDiagnostics = [];

        if (diagPath && STKindChecker.isResourcePathSegmentParam(diagPath)) {
            resourcePathDiagnostics = diagPath?.paramName?.viewState?.diagnosticsInRange && diagPath?.paramName?.viewState?.diagnosticsInRange || [];
            resourcePathDiagnostics = diagPath?.typeDescriptor?.viewState?.diagnosticsInRange && diagPath?.typeDescriptor?.viewState?.diagnosticsInRange || [];
        } else if (diagPath && STKindChecker.isIdentifierToken(diagPath)) {
            resourcePathDiagnostics = diagPath?.viewState?.diagnostics || [];
        }

        return resourcePathDiagnostics;
    };

    const handlePathChange = async (value: string) => {
        setShouldUpdatePath(false);
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
        const pathString = pathStr ? pathStr : ".";
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
            setNewlyCreatedRecord(returnType);
        }
    }

    const formContent = () => {
        return (
            <>
                <div className={connectorClasses.formContentWrapper}>
                    <div className={connectorClasses.formNameWrapper}>
                        <FieldTitle title="Path" optional={false}/>
                        <LiteExpressionEditor
                            testId="resource-path"
                            diagnostics={
                                (currentComponentName === "Path" && currentComponentSyntaxDiag)
                                || getResourcePathDiagnostics()
                            }
                            defaultValue={getResourcePath(model?.relativeResourcePath).trim()}
                            externalChangedValue={shouldUpdatePath ? getResourcePath(model?.relativeResourcePath).trim() : undefined}
                            onChange={handlePathChange}
                            completions={completions}
                            onFocus={onPathFocus}
                            disabled={currentComponentName !== "Path" && isEditInProgress}
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
                                    completions={completions}
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
                            recordCompletions={completions.filter((completion) => completion.kind !== "Module")}
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
