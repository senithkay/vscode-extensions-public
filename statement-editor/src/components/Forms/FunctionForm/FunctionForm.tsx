/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import React, { useContext, useEffect, useState } from 'react';

import { Button, CircularProgress, Divider, FormControl } from "@material-ui/core";
import { default as AddIcon } from "@material-ui/icons/Add";
import { LiteExpressionEditor } from "@wso2-enterprise/ballerina-expression-editor";
import {
    createFunctionSignature,
    ExpressionEditorLangClientInterface,
    getSource,
    STModification,
    updateFunctionSignature,
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    ConfigPanelSection,
    dynamicConnectorStyles as connectorStyles,
    FormActionButtons,
    FormHeaderSection,
    FormTextInput,
    useStyles as useFormStyles
} from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import {
    DefaultableParam,
    FunctionDefinition,
    IncludedRecordParam,
    NodePosition,
    RequiredParam,
    RestParam,
    STKindChecker,
    STNode
} from "@wso2-enterprise/syntax-tree";
import debounce from "lodash.debounce";

import { CurrentModel, StmtDiagnostic, SuggestionItem } from "../../../models/definitions";
import { FormEditorContext } from "../../../store/form-editor-context";
import { getUpdatedSource } from "../../../utils";
import { getPartialSTForModuleMembers } from "../../../utils/ls-utils";
import { completionEditorTypeKinds } from '../../InputEditor/constants';
import { CompletionEditor } from '../components/CompletionEditor/completionEditor';
import { FieldTitle } from '../components/FieldTitle/fieldTitle';
import { recalculateItemIds } from "../Utils/FormUtils";

import { FunctionParam, FunctionParamItem } from "./FunctionParamEditor/FunctionParamItem";
import { FunctionParamSegmentEditor } from "./FunctionParamEditor/FunctionSegmentEditor";

export interface FunctionProps {
    model: FunctionDefinition;
    completions: SuggestionItem[];
}

export function FunctionForm(props: FunctionProps) {
    const { model, completions } = props;

    const { targetPosition, isEdit, type, onChange, applyModifications, onCancel, getLangClient } = useContext(FormEditorContext);

    const formClasses = useFormStyles();
    const connectorClasses = connectorStyles();
    const isMainFunction = (type === "Main");

    // States related to component model
    const [functionName, setFunctionName] = useState<string>(model ? model.functionName.value : "");
    const [returnType, setReturnType] = useState<string>(
        model ? model.functionSignature?.returnTypeDesc?.type?.source?.trim() : "");

    // States related to syntax diagnostics
    const [currentComponentName, setCurrentComponentName] = useState<string>("");
    const [currentComponentSyntaxDiag, setCurrentComponentSyntaxDiag] = useState<StmtDiagnostic[]>(undefined);
    const [currentComponentCompletions, setCurrentComponentCompletions] = useState<SuggestionItem[]>(undefined);

    // States related parameters
    const [parameters, setParameters] = useState<FunctionParam[]>([]);
    const [editingSegmentId, setEditingSegmentId] = useState<number>(-1);
    const [addingNewParam, setAddingNewParam] = useState(false);

    const functionBodyBlock = model && STKindChecker.isFunctionBodyBlock(model.functionBody) && model?.functionBody;
    const params = model?.functionSignature?.parameters.filter(param => !STKindChecker.isCommaToken(param));

    const functionParamChange = async (funcName: string, parametersStr: string, returnTypeStr: string,
        currentModel?: CurrentModel, newValue?: string,
        completionKinds?: number[]) => {

        const codeSnippet = getSource(updateFunctionSignature(funcName, parametersStr,
            returnTypeStr ? `returns ${returnTypeStr}` : "", {
            ...targetPosition, startColumn: model?.functionName?.position?.startColumn
        })
        );
        const updatedContent = getUpdatedSource(codeSnippet, model?.source, {
            ...model?.functionSignature?.position, startColumn: model?.functionName?.position?.startColumn
        }, undefined, true);
        const partialST = await getPartialSTForModuleMembers(
            { codeSnippet: updatedContent.trim() }, getLangClient
        );
        if (!partialST.syntaxDiagnostics.length) {
            setCurrentComponentSyntaxDiag(undefined);
            if (newValue && currentModel) {
                onChange(updatedContent, partialST, undefined, currentModel, newValue, completionKinds);
            } else {
                onChange(updatedContent, partialST);
            }
        } else {
            setCurrentComponentSyntaxDiag(partialST.syntaxDiagnostics);
        }
    }

    // Function name related functions
    const onNameFocus = () => {
        setCurrentComponentCompletions([]);
        setCurrentComponentName("Name");
    }
    const onNameChange = async (value: string) => {
        setFunctionName(value);
        const parametersStr = parameters.map((item) => `${item.type.value} ${item.name.value}`).join(",");
        const currentModel: CurrentModel = {
            model: model?.functionName
        };
        await functionParamChange(value, parametersStr, returnType, currentModel, value);
    }
    const debouncedNameChange = debounce(onNameChange, 1000);

    // Return type related functions
    const onReturnTypeChange = async (value: string) => {
        // TODO: remove function return validations
        setReturnType(value);
        const parametersStr = parameters.map((item) => `${item.type.value} ${item.name.value}`).join(",");
        const codeSnippet = getSource(updateFunctionSignature(functionName, parametersStr,
            value ? `returns ${value}` : "", {
            ...targetPosition, startColumn: model?.functionName?.position?.startColumn
        })
        );
        const updatedContent = await getUpdatedSource(codeSnippet, model?.source, {
            ...model?.functionSignature?.position, startColumn: model?.functionName?.position?.startColumn
        }, undefined, true);
        const partialST = await getPartialSTForModuleMembers(
            { codeSnippet: updatedContent.trim() }, getLangClient
        ) as FunctionDefinition;
        const currentModel: CurrentModel = {
            model: partialST?.functionSignature?.returnTypeDesc?.type
        };
        if (!partialST.syntaxDiagnostics.length) {
            setCurrentComponentSyntaxDiag(undefined);
            if (value && currentModel) {
                onChange(updatedContent, partialST, undefined, currentModel, value, completionEditorTypeKinds);
            } else {
                onChange(updatedContent, partialST);
            }
        } else {
            if (currentModel) {
                onChange(updatedContent, partialST, undefined, currentModel, value, completionEditorTypeKinds);
            }
            setCurrentComponentSyntaxDiag(partialST.syntaxDiagnostics);
        }


        // await functionParamChange(functionName.value, parametersStr, value, currentModel, value, );
    }

    const onReturnFocus = async () => {
        // const parametersStr = parameters.map((item) => `${item.type.value} ${item.name.value}`).join(",");
        // const currentModel: CurrentModel = {
        //     model: model.functionSignature?.returnTypeDesc?.type
        // };
        // await functionParamChange(functionName.value, parametersStr, returnType.value, currentModel, "");
        setCurrentComponentCompletions([]);
        setCurrentComponentName("Return");
    }

    const debouncedReturnChange = debounce(onReturnTypeChange, 1000);

    // Param related functions
    const openNewParamView = () => {
        setAddingNewParam(true);
        setEditingSegmentId(-1);
    };

    const handleOnEdit = (funcParam: FunctionParam) => {
        const id = parameters.findIndex(param => param.id === funcParam.id);
        // Once edit is clicked
        if (id > -1) {
            setEditingSegmentId(id);
        }
        setAddingNewParam(false);
    };
    const onDeleteParam = (paramItem: FunctionParam) => {
        setParameters(parameters.filter((item) => item.id !== paramItem.id));
        recalculateItemIds(parameters);
    }
    const closeNewParamView = () => {
        setAddingNewParam(false);
        setEditingSegmentId(-1);
        setCurrentComponentName(undefined);
        setCurrentComponentSyntaxDiag(undefined);
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
    const onParamChange = async (param: FunctionParam) => {
        setCurrentComponentName("Param");
        const newParams = [...parameters, param];
        const parametersStr = newParams
            .map((item) => `${item.type.value} ${item.name.value}`)
            .join(",");
        await functionParamChange(functionName, parametersStr, returnType);
    };
    const onUpdateParamChange = async (param: FunctionParam) => {
        setCurrentComponentName("Param")
        const newParams = [...parameters];
        newParams[param.id] = param;
        const parametersStr = newParams
            .map((item) => `${item.type.value} ${item.name.value}`)
            .join(",");
        await functionParamChange(functionName, parametersStr, returnType);
    };
    const onSaveNewParam = (param: FunctionParam) => {
        setParameters([...parameters, param]);
        setAddingNewParam(false);
        setEditingSegmentId(-1);
    };

    const handleOnSave = () => {
        const parametersStr = parameters ? parameters.map((item) => `${item.type.value} ${item.name.value}`).join(",") : "";
        if (isEdit) {
            applyModifications([
                updateFunctionSignature(functionName, parametersStr,
                    returnType ? `returns ${returnType}` : "", {
                    ...targetPosition, startColumn: model?.functionName?.position?.startColumn
                })
            ]);
        } else {
            applyModifications([
                createFunctionSignature(isMainFunction ? "public" : "", functionName, parametersStr,
                    returnType ? `returns ${returnType}` : "", targetPosition)
            ]);
        }
        onCancel();
    }

    const paramElements: React.ReactElement[] = [];
    parameters?.forEach((value, index) => {
        if (value.name.value) {
            if (editingSegmentId !== index) {
                paramElements.push(
                    <FunctionParamItem
                        key={index}
                        functionParam={value}
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
                        segment={value}
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
        setFunctionName(model ? model.functionName.value : "");

        if (currentComponentName === "") {
            const editParams: FunctionParam[] = model?.functionSignature.parameters
                .filter((param) => STKindChecker.isRequiredParam(param))
                .map((param: any, index) => ({
                    id: index,
                    name: { value: param.paramName.value, isInteracted: false },
                    type: { value: param.typeName.source.trim(), isInteracted: false },
                }));
            setParameters(editParams);
        }

        if (completions) {
            setCurrentComponentCompletions(completions)
        }
    }, [model, completions]);

    useEffect(() => {
        setFunctionName(model?.functionName?.value);
    }, [model]);

    const formContent = () => {
        return (
            <>

                <div className={connectorClasses.formContentWrapper}>
                    <div className={connectorClasses.formNameWrapper}>
                        <FieldTitle title='Name' optional={false} />
                        <LiteExpressionEditor
                            defaultValue={functionName}
                            diagnostics={model?.functionName?.viewState?.diagnosticsInRange}
                            focus={true}
                            onChange={debouncedNameChange}
                            onFocus={onNameFocus}
                            stModel={model}
                            disabled={addingNewParam || (currentComponentSyntaxDiag && currentComponentName !== "Name")}
                            hideSuggestions={true}
                            // placeholder={"Ex: name"}
                            // defaultValue={(functionName?.isInteracted || isEdit || isMainFunction) ? functionName.value : ""}
                            customProps={{
                                index: 1,
                                optional: false
                            }}
                        // diagsInRange={model?.functionSignature?.returnTypeDesc?.viewState?.diagnosticsInRange}
                        // errorMessage={(currentComponentSyntaxDiag && currentComponentName === "Name"
                        //     && currentComponentSyntaxDiag[0].message) ||
                        //     model?.functionName?.viewState?.diagnosticsInRange[0]?.message}
                        // disabled={addingNewParam || isMainFunction || (currentComponentSyntaxDiag && currentComponentName !== "Name")}
                        />
                        <Divider className={connectorClasses.sectionSeperatorHR} />
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
                                />
                            ) : (
                                <Button
                                    data-test-id="param-add-button"
                                    onClick={openNewParamView}
                                    className={connectorClasses.addParameterBtn}
                                    startIcon={<AddIcon />}
                                    color="primary"
                                    disabled={currentComponentSyntaxDiag?.length > 0}
                                >
                                    Add parameter
                                </Button>
                            )}
                        </ConfigPanelSection>
                        <Divider className={connectorClasses.sectionSeperatorHR} />
                        <FieldTitle title='Return Type' optional={true} />
                        <LiteExpressionEditor
                            diagnostics={model?.functionSignature?.returnTypeDesc?.viewState?.diagnosticsInRange}
                            defaultValue={returnType}
                            onChange={debouncedReturnChange}
                            completions={currentComponentCompletions}
                            stModel={model}
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
        )
    };
    const loader = (
        <div style={{ textAlign: 'center' }}>
            <CircularProgress />
        </div>
    )

    const contentRenderCondition = functionName || returnType;

    return (
        <FormControl data-testid="function-form" className={formClasses.wizardFormControl}>
            <FormHeaderSection
                onCancel={onCancel}
                formTitle={"Function Configuration"}
                defaultMessage={"Function Configuration"}
            />
            {!contentRenderCondition && loader}
            {contentRenderCondition && formContent()}
        </FormControl >
    )
}
