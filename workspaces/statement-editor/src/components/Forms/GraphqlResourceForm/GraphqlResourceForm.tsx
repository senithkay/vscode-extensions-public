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
import { LiteExpressionEditor } from "@wso2-enterprise/ballerina-expression-editor";
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

import { StatementSyntaxDiagnostics, SuggestionItem } from "../../../models/definitions";
import { FormEditorContext } from "../../../store/form-editor-context";
import { getUpdatedSource } from "../../../utils";
import { getPartialSTForModuleMembers } from "../../../utils/ls-utils";
import { completionEditorTypeKinds } from "../../InputEditor/constants";
import { FieldTitle } from "../components/FieldTitle/fieldTitle";
import { FunctionParam, FunctionParamItem } from "../FunctionForm/FunctionParamEditor/FunctionParamItem";
import { FunctionParamSegmentEditor } from "../FunctionForm/FunctionParamEditor/FunctionSegmentEditor";
import { generateParameterSectionString, getParamString, getResourcePath } from "../ResourceForm/util";

export interface FunctionProps {
    model: ResourceAccessorDefinition;
    completions: SuggestionItem[];
}

// TODO: Fix the proper functionality of resource form
export function GraphqlResourceForm(props: FunctionProps) {
    const { model, completions } = props;

    const {
        targetPosition,
        isEdit,
        type,
        onChange,
        applyModifications,
        onCancel,
        getLangClient
    } = useContext(FormEditorContext);

    const connectorClasses = connectorStyles();

    // States related to component model
    const [resourcePath, setResourcePath] = useState<string>(model ? getResourcePath(model?.relativeResourcePath).trim() : "");
    const [returnType, setReturnType] = useState<string>(model ? model.functionSignature?.returnTypeDesc?.type?.source?.trim() : "");
    const [shouldUpdatePath, setShouldUpdatePath] = useState<boolean>(false);
    const [isEditInProgress, setIsEditInProgress] = useState<boolean>(false);

    // States related to syntax diagnostics
    const [currentComponentName, setCurrentComponentName] = useState<string>("");
    const [currentComponentSyntaxDiag, setCurrentComponentSyntaxDiag] = useState<StatementSyntaxDiagnostics[]>(undefined);
    const [currentComponentCompletions, setCurrentComponentCompletions] = useState<SuggestionItem[]>(undefined);

    // States related parameters
    const [parameters, setParameters] = useState<FunctionParam[]>([]);
    const [editingSegmentId, setEditingSegmentId] = useState<number>(-1);
    const [addingNewParam, setAddingNewParam] = useState(false);

    const params = model?.functionSignature?.parameters.filter(param => !STKindChecker.isCommaToken(param));

    // Return type related functions
    const onReturnTypeChange = (value: string) => {
        handleResourceParamChange(
            model.functionName.value,
            getResourcePath(model.relativeResourcePath),
            generateParameterSectionString(model?.functionSignature?.parameters),
            value,
            model.functionSignature?.returnTypeDesc?.type,
            value
        );
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
            .map((item) => `${item.type} ${item.name}`)
            .join(", ");
        await handleResourceParamChange(
            model.functionName.value,
            getResourcePath(model.relativeResourcePath),
            parametersStr,
            model.functionSignature?.returnTypeDesc?.type?.source
        );
    };

    const onParamChange = async (param: FunctionParam) => {
        setCurrentComponentName("Param");
        const newParams = [...parameters, param];
        const parametersStr = newParams
            .map((item) => `${item.type} ${item.name}`)
            .join(", ");
        await handleResourceParamChange(
            model.functionName.value,
            getResourcePath(model.relativeResourcePath),
            parametersStr,
            model.functionSignature?.returnTypeDesc?.type?.source
        );
    };

    const onUpdateParamChange = async (param: FunctionParam) => {
        setCurrentComponentName("Param");
        const newParams = [...parameters];
        newParams[param.id] = param;
        const parametersStr = newParams
            .map((item) => `${item.type} ${item.name}`)
            .join(", ");
        await handleResourceParamChange(
            model.functionName.value,
            getResourcePath(model.relativeResourcePath),
            parametersStr,
            model.functionSignature?.returnTypeDesc?.type?.source
        );
    };

    const handleOnSave = () => {
        if (isEdit) {
            applyModifications([
                updateResourceSignature(
                    model.functionName.value,
                    getResourcePath(model.relativeResourcePath),
                    getParamString(model.functionSignature.parameters),
                    model.functionSignature?.returnTypeDesc?.type?.source,
                    targetPosition)
            ]);
        } else {
            applyModifications([
                createResource(
                    model.functionName.value,
                    getResourcePath(model.relativeResourcePath),
                    getParamString(model.functionSignature.parameters),
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

    const onSaveNewParam = (param: FunctionParam) => {
        setParameters([...parameters, param]);
        setAddingNewParam(false);
        setEditingSegmentId(-1);
    };

    const onDeleteParam = async (paramItem: FunctionParam) => {
        // setParameters(parameters.filter((item) => item.id !== paramItem.id));
        // recalculateItemIds(parameters);
        const newParams = parameters.filter((item) => item.id !== paramItem.id);
        const parametersStr = newParams
            .map((item) => `${item.type} ${item.name}`)
            .join(", ");
        await handleResourceParamChange(
            model.functionName.value,
            getResourcePath(model.relativeResourcePath),
            parametersStr,
            model.functionSignature?.returnTypeDesc?.type?.source
        );
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
                    <FunctionParamItem
                        key={index}
                        functionParam={param}
                        readonly={addingNewParam || (currentComponentSyntaxDiag?.length > 0)}
                        onDelete={onDeleteParam}
                        onEditClick={handleOnEdit}
                    />
                );
            } else if (editingSegmentId === index) {
                paramElements.push(
                    <FunctionParamSegmentEditor
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
        setReturnType(model ? model.functionSignature?.returnTypeDesc?.type?.source?.trim() : "");

        if (currentComponentName === "") {
            const editParams: FunctionParam[] = model?.functionSignature.parameters
                .filter((param) => STKindChecker.isRequiredParam(param))
                .map((param: any, index) => ({
                    id: index,
                    name: param.paramName.value,
                    type: param.typeName.source.trim(),
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
                                <FunctionParamSegmentEditor
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
                        <LiteExpressionEditor
                            testId={"return-type"}
                            diagnostics={model?.functionSignature?.returnTypeDesc?.viewState?.diagnosticsInRange}
                            defaultValue={returnType}
                            onChange={onReturnTypeChange}
                            completions={currentComponentCompletions}
                            onFocus={onReturnFocus}
                            disabled={addingNewParam || (currentComponentSyntaxDiag && currentComponentName !== "Return")}
                            customProps={{
                                index: 2,
                                optional: true
                            }}
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
                formTitle={"Configure GraphQL Query"}
                defaultMessage={"Configure GraphQL Query"}
            />
            {formContent()}
        </FormControl>
    );
}
