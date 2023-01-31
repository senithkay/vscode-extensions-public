// tslint:disable: jsx-no-multiline-js
import React, { useContext, useEffect, useState } from "react";

import { Button, CircularProgress, Divider, FormControl } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import { LiteExpressionEditor } from "@wso2-enterprise/ballerina-expression-editor";
import {
    createFunctionSignature, createResource,
    getSource,
    updateFunctionSignature, updateResourceSignature
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    ConfigPanelSection,
    dynamicConnectorStyles as connectorStyles, FormActionButtons,
    FormHeaderSection, PrimaryButton, SecondaryButton
} from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import {
    DefaultableParam, FunctionDefinition,
    IncludedRecordParam, RequiredParam,
    ResourceAccessorDefinition, RestParam,
    STKindChecker,
    STNode
} from "@wso2-enterprise/syntax-tree";

import { CurrentModel, StatementSyntaxDiagnostics, SuggestionItem } from "../../../models/definitions";
import { FormEditorContext } from "../../../store/form-editor-context";
import { getUpdatedSource } from "../../../utils";
import { getPartialSTForModuleMembers } from "../../../utils/ls-utils";
import { completionEditorTypeKinds } from "../../InputEditor/constants";
import { FieldTitle } from "../components/FieldTitle/fieldTitle";
import { FunctionParam, FunctionParamItem } from "../FunctionForm/FunctionParamEditor/FunctionParamItem";
import { FunctionParamSegmentEditor } from "../FunctionForm/FunctionParamEditor/FunctionSegmentEditor";
import { generateParameterSectionString, genParamName, getParamString, getResourcePath } from "../ResourceForm/util";

export interface FunctionProps {
    model: ResourceAccessorDefinition;
    completions: SuggestionItem[];
}

// TODO: Fix the proper functionality of resource form
export function GraphqlResourceForm(props: FunctionProps) {
    const { model, completions } = props;

    const { targetPosition, isEdit, type, onChange, applyModifications, onCancel, getLangClient } = useContext(FormEditorContext);

    const connectorClasses = connectorStyles();
    const isMainFunction = (type === "Main");

    // States related to component model
    const [resourcePath, setResourcePath] = useState<string>(model ? getResourcePath(model?.relativeResourcePath).trim() : "");
    const [returnType, setReturnType] = useState<string>("");
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
            if (/\s+/.test(funcName)) {
                // This is to check whether function name contains any spaces. If it contains any marks as syntax error
                setCurrentComponentSyntaxDiag([{message: "Space characters are not allowed"}]);
            } else {
                setCurrentComponentSyntaxDiag(undefined);
            }
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
        setCurrentComponentName("Path");
    }


    // Return type related functions
    const onReturnTypeChange = (value: string) => {
        // setIsEditInProgress(true);
        handleResourceParamChange(
            model.functionName.value,
            getResourcePath(model.relativeResourcePath),
            generateParameterSectionString(model?.functionSignature?.parameters),
            value,
            model.functionSignature?.returnTypeDesc?.type,
            value
        );
    }

    const onReturnFocus = async () => {
        setCurrentComponentCompletions([]);
        setCurrentComponentName("Return");
    }


    // Param related functions
    const openNewParamView = async () => {
        setCurrentComponentName("Param");
        setAddingNewParam(true);
        setEditingSegmentId(-1);
        const newParams = [...parameters, {type: "string", name: "name"}];
        const parametersStr = newParams
            .map((item) => `${item.type} ${item.name}`)
            .join(", ");
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
    }

    const paramElements: React.ReactElement[] = [];
    parameters?.forEach((param, index) => {
        if (param.name) {
            if (editingSegmentId !== index) {
                paramElements.push(
                    <FunctionParamItem
                        key={index}
                        functionParam={param}
                        readonly={addingNewParam || (currentComponentSyntaxDiag?.length > 0)}
                        // onDelete={onDeleteParam}
                        // onEditClick={handleOnEdit}
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
                        // onUpdate={handleOnUpdateParam}
                        // onChange={onUpdateParamChange}
                        isEdit={true}
                    />
                );
            }
        }
    });

    useEffect(() => {
        setReturnType(model ? model.functionSignature?.returnTypeDesc?.type?.source?.trim() : "");
        // setFunctionName(model ? model.functionName.value : "");

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
            setCurrentComponentCompletions(completions)
        }
    }, [model, completions]);

    // useEffect(() => {
    //     setFunctionName(model?.functionName?.value);
    // }, [model]);

    const getResourcePathDiagnostics = () => {
        const diagPath = model.relativeResourcePath?.find(
            resPath => resPath?.viewState?.diagnosticsInRange?.length > 0);

        let resourcePathDiagnostics = [];

        if (diagPath && STKindChecker.isResourcePathSegmentParam(diagPath)) {
            resourcePathDiagnostics = diagPath?.paramName?.viewState?.diagnosticsInRange && diagPath?.paramName?.
                viewState?.diagnosticsInRange || [];
            resourcePathDiagnostics = diagPath?.typeDescriptor?.viewState?.diagnosticsInRange && diagPath?.
                typeDescriptor?.viewState?.diagnosticsInRange || [];
        } else if (diagPath && STKindChecker.isIdentifierToken(diagPath)) {
            resourcePathDiagnostics = diagPath?.viewState?.diagnostics || [];
        }

        return resourcePathDiagnostics;
    }

    const handlePathChange = async (value: string) => {
        setShouldUpdatePath(false);
        setResourcePath(value);
        await handleResourceParamChange(
            model.functionName.value,
            value,
            generateParameterSectionString(model?.functionSignature?.parameters),
            model.functionSignature?.returnTypeDesc?.type?.source,
        );
    };

    const onPathFocus = () => {
        setCurrentComponentName("Path");
    }

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

    const handleParamEditorChange = async (paramString: string, stModel?: STNode, currentValue?: string) => {
        // if (!avoidValueCommit) {
        //     setQueryParam(value);
        // }
        // setCurrentComponentName("QueryParam");
        await handleResourceParamChange(
            model.functionName.value,
            getResourcePath(model.relativeResourcePath),
            paramString,
            model.functionSignature?.returnTypeDesc?.type?.source,
            stModel,
            currentValue
        );
    };

    const closeNewParamView = () => {
        setAddingNewParam(false);
        setEditingSegmentId(-1);
        setCurrentComponentName(undefined);
        setCurrentComponentSyntaxDiag(undefined);
    };

    const onSaveNewParam = (param: FunctionParam) => {
        setParameters([...parameters, param]);
        setAddingNewParam(false);
        setEditingSegmentId(-1);
    };

    const formContent = () => {
        return (
            <>
                <div className={connectorClasses.formContentWrapper}>
                    <div className={connectorClasses.formNameWrapper}>
                        <FieldTitle title='Path' optional={false} />
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
                                    completions={completions}
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
                        <FieldTitle title='Return Type' optional={false} />
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
        )
    };
    const loader = (
        <div style={{ textAlign: 'center' }}>
            <CircularProgress />
        </div>
    )

    return (
        <FormControl data-testid="function-form" className={connectorClasses.wizardFormControlExtended}>
            <FormHeaderSection
                onCancel={onCancel}
                formTitle={"Configure GraphQL Query"}
                defaultMessage={"Configure GraphQL Query"}
            />
            {formContent()}
        </FormControl >
    );
}
