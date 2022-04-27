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
import React, { useEffect, useState } from 'react';

import { Button, Divider, FormControl } from "@material-ui/core";
import { default as AddIcon } from "@material-ui/icons/Add";
import {
    createFunctionSignature,
    ExpressionEditorLangClientInterface,
    getSource,
    mutateFunctionSignature,
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
import { FunctionDefinition, NodePosition, STKindChecker } from "@wso2-enterprise/syntax-tree";

import { StmtDiagnostic } from "../../../models/definitions";
import { getPartialSTForTopLevelComponents } from "../../../utils/ls-utils";
import { SimpleField } from "../Types";
import { recalculateItemIds } from "../Utils/FormUtils";

import { FunctionParam, FunctionParamItem } from "./FunctionParamEditor/FunctionParamItem";
import { FunctionParamSegmentEditor } from "./FunctionParamEditor/FunctionSegmentEditor";

export interface FunctionProps {
    model: FunctionDefinition;
    targetPosition: NodePosition;
    fileURI: string;
    onChange: (genSource: string) => void;
    onCancel: () => void;
    getLangClient: () => Promise<ExpressionEditorLangClientInterface>;
    applyModifications: (modifications: STModification[]) => void;
}

export function FunctionForm(props: FunctionProps) {
    const { targetPosition, model, fileURI, onChange, onCancel, getLangClient, applyModifications } = props;

    const formClasses = useFormStyles();
    const connectorClasses = connectorStyles();

    // States related to component model
    const [functionName, setFunctionName] = useState<SimpleField>({
        value: model ? model.functionName.value : "", isInteracted: false
    });
    const [returnType, setReturnType] = useState<SimpleField>({
        value: model ? model.functionSignature?.returnTypeDesc?.type?.source?.trim() : "", isInteracted: false
    });

    // States related to syntax diagnostics
    const [currentComponentName, setCurrentComponentName] = useState<string>("");
    const [currentComponentDiag, setCurrentComponentDiag] = useState<StmtDiagnostic[]>(undefined);

    // States related parameters
    const [parameters, setParameters] = useState<FunctionParam[]>([]);
    const [editingSegmentId, setEditingSegmentId] = useState<number>(-1);
    const [addingNewParam, setAddingNewParam] = useState(false);

    const onNameFocus = (value: string) => {
        setCurrentComponentName("Name");
    }
    const onNameChange = async (value: string) => {
        setFunctionName({value, isInteracted: true});
        const genSource = getSource(mutateFunctionSignature("", value, "",
            returnType.value ? `returns ${returnType.value}` : "", targetPosition));
        const partialST = await getPartialSTForTopLevelComponents(
            {codeSnippet: genSource.trim()}, getLangClient
        );
        if (!partialST.syntaxDiagnostics.length) {
            setCurrentComponentDiag(undefined);
            onChange(genSource);
        } else {
            setCurrentComponentDiag(partialST.syntaxDiagnostics);
        }
    }

    const onReturnTypeChange = async (value: string) => {
        setReturnType({value, isInteracted: true});
        const genSource = getSource(createFunctionSignature("", functionName.value, "",
            value ? `returns ${value}` : "", targetPosition));
        const partialST = await getPartialSTForTopLevelComponents(
            {codeSnippet: genSource.trim()}, getLangClient
        );
        if (!partialST.syntaxDiagnostics.length) {
            setCurrentComponentDiag(undefined);
            onChange(genSource);
        } else {
            setCurrentComponentDiag(partialST.syntaxDiagnostics);
        }
    }
    const onReturnFocus = (value: string) => {
        setCurrentComponentName("Return");
    }

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
        setCurrentComponentDiag(undefined);
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
        const d = parameters;
        setCurrentComponentName("Param")
        const newParams = [...parameters, param];
        const parametersStr = newParams
            .map((item) => `${item.type.value} ${item.name.value}`)
            .join(",");
        const genSource = getSource(mutateFunctionSignature("", functionName.value, parametersStr,
            returnType.value ? `returns ${returnType.value}` : "", targetPosition));
        const partialST = await getPartialSTForTopLevelComponents(
            {codeSnippet: genSource.trim()}, getLangClient
        );
        if (!partialST.syntaxDiagnostics.length) {
            setCurrentComponentDiag(undefined);
            onChange(genSource);
        } else {
            setCurrentComponentDiag(partialST.syntaxDiagnostics);
        }
    };
    const onSaveNewParam = (param: FunctionParam) => {
        setParameters([...parameters, param]);
        setAddingNewParam(false);
        setEditingSegmentId(-1);
    };

    const handleOnSave = () => {
        if (model) {
            applyModifications([
                updateFunctionSignature(functionName.value, "",
                    returnType.value ? `returns ${returnType.value}` : "", {
                    ...targetPosition, startColumn : model?.functionName?.position?.startColumn
                })
            ]);
        } else {
            applyModifications([
                createFunctionSignature("", functionName.value, "",
                    returnType.value ? `returns ${returnType.value}` : "", targetPosition)
            ]);
        }
    }

    const paramElements: React.ReactElement[] = [];
    parameters?.forEach((value, index) => {
        if (value.name.value) {
            if (editingSegmentId !== index) {
                paramElements.push(
                    <FunctionParamItem
                        key={index}
                        functionParam={value}
                        readonly={addingNewParam || (currentComponentDiag?.length > 0)}
                        onDelete={onDeleteParam}
                        onEditClick={handleOnEdit}
                    />
                );
            } else if (editingSegmentId === index) {
                paramElements.push(
                    <FunctionParamSegmentEditor
                        id={editingSegmentId}
                        segment={value}
                        syntaxDiag={currentComponentDiag}
                        onCancel={closeNewParamView}
                        onUpdate={handleOnUpdateParam}
                        onChange={onParamChange}
                        validateParams={null}
                        // position={paramPosition}
                        isEdit={!!model}
                        paramCount={parameters.length}
                    />
                );
            }
        }
    });

    useEffect(() => {
        setReturnType({
            ...returnType, value: model ? model.functionSignature?.returnTypeDesc?.type?.source?.trim() : ""
        });
        setFunctionName({...functionName, value: model ? model.functionName.value : ""});

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
    }, [model]);

    return (
        <FormControl data-testid="listener-form" className={formClasses.wizardFormControl}>
            <FormHeaderSection
                onCancel={onCancel}
                formTitle={"Function Configuration"}
                defaultMessage={"Function Configuration"}
            />
            <div className={connectorClasses.formContentWrapper}>
                <div className={connectorClasses.formNameWrapper}>
                    <FormTextInput
                        label="Name"
                        dataTestId="service-name"
                        defaultValue={functionName.value}
                        onChange={onNameChange}
                        customProps={{
                            optional: true,
                            isErrored: (currentComponentDiag !== undefined && currentComponentName === "Name")
                        }}
                        errorMessage={"Diagnostics Name"}
                        onBlur={null}
                        onFocus={onNameFocus}
                        placeholder={"Enter Name"}
                        size="small"
                        disabled={addingNewParam || (currentComponentDiag && currentComponentName !== "Name")}
                    />
                    <Divider className={connectorClasses.sectionSeperatorHR} />
                    <ConfigPanelSection title={"Parameters"}>
                        {paramElements}
                        {addingNewParam ? (
                            <FunctionParamSegmentEditor
                                id={parameters.length}
                                syntaxDiag={currentComponentDiag}
                                onCancel={closeNewParamView}
                                onChange={onParamChange}
                                onSave={onSaveNewParam}
                                // position={paramPosition}
                                isEdit={!!model}
                                paramCount={parameters.length}
                            />
                        ) : (!(currentComponentDiag?.length > 0) && (
                                <Button
                                    onClick={openNewParamView}
                                    className={connectorClasses.addParameterBtn}
                                    startIcon={<AddIcon />}
                                    color="primary"
                                >
                                    Add parameter
                                </Button>
                        ))}
                    </ConfigPanelSection>
                    <Divider className={connectorClasses.sectionSeperatorHR} />
                    <FormTextInput
                        label="Return Type"
                        dataTestId="return-type"
                        defaultValue={returnType.value}
                        customProps={{
                            optional: true,
                            isErrored: (currentComponentDiag !== undefined && currentComponentName === "Return")
                        }}
                        errorMessage={"Diagnostics"}
                        onChange={onReturnTypeChange}
                        onBlur={null}
                        onFocus={onReturnFocus}
                        placeholder={"Enter Return Type"}
                        size="small"
                        disabled={addingNewParam || (currentComponentDiag && currentComponentName !== "Return")}
                    />
                </div>
            </div>
            <FormActionButtons
                cancelBtnText="Cancel"
                cancelBtn={true}
                saveBtnText="Save"
                onSave={handleOnSave}
                onCancel={onCancel}
                validForm={true}
            />
        </FormControl>
    )
}
