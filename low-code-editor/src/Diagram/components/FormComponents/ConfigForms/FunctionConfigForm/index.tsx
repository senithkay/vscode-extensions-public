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

import { NodePosition, STKindChecker, STNode } from "@ballerina/syntax-tree";
import { Box, FormControl, Typography } from "@material-ui/core";

import { AddIcon, FunctionIcon } from "../../../../../assets/icons";
import ConfigPanel, { Section } from "../../../../../components/ConfigPanel";
import { useDiagramContext } from "../../../../../Contexts/Diagram";
import { STModification } from "../../../../../Definitions";
import {
  createFunctionSignature,
  updateFunctionSignature,
} from "../../../../utils/modification-util";
import { PrimaryButton } from "../../FormFieldComponents/Button/PrimaryButton";
import { SecondaryButton } from "../../FormFieldComponents/Button/SecondaryButton";
import { FormTextInput } from "../../FormFieldComponents/TextField/FormTextInput";
import { QueryParamItem as FunctionParamItem } from "../../DialogBoxes/DropDown/ApiConfigureWizard/components/queryParamEditor/queryParamItem";
import { QueryParamSegmentEditor as FunctionParamSegmentEditor } from "../../DialogBoxes/DropDown/ApiConfigureWizard/components/queryParamEditor/segmentEditor";
import { ReturnTypeItem } from "../../DialogBoxes/DropDown/ApiConfigureWizard/components/ReturnTypeEditor/ReturnTypeItem";
import { ReturnTypeSegmentEditor } from "../../DialogBoxes/DropDown/ApiConfigureWizard/components/ReturnTypeEditor/SegmentEditor";
import {
  QueryParam,
  ReturnType,
} from "../../DialogBoxes/DropDown/ApiConfigureWizard/types";
import { functionParamTypes } from "../../DialogBoxes/DropDown/ApiConfigureWizard/util";
import { wizardStyles as useFormStyles } from "../style";

interface FunctionConfigFormProps {
    model?: STNode;
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
    const {
        props: { syntaxTree },
        api: {
            code: { modifyDiagram },
        },
    } = useDiagramContext();
    const existingFunctionNames = useRef([]);
    const disableSaveBtn =
        !!!functionName ||
        existingFunctionNames?.current?.includes(functionName);

    const handleOnSave = () => {
        const parametersStr = parameters
            .map((item) => `${item.type} ${item.name}`)
            .join(",");
        const returnType = returnTypes
            .map((item) => `${item.type}${item.isOptional ? "?" : ""}`)
            .join("|");
        let returnTypeStr = returnType ? `returns ${returnType}` : "";

        // If none of the types are optional, append `|error?` to the return types
        if (returnTypeStr && returnTypes.every((item) => !item.isOptional)) {
            // FIXME: if `error` type is selected, it would become `error|error?`
            returnTypeStr = `${returnTypeStr}|error?`;
        }

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

    const validateParams = (value: string) => {
        const isParamExist = parameters.some((item) => item.name === value);
        return {
            error: isParamExist,
            message: isParamExist ? `${value} already exists` : "",
        };
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
                const returnParams: ReturnType[] = returnArr.map(
                    (item, index) => ({
                        id: index,
                        isOptional: item.trim().endsWith("?"),
                        type: item.trim().replace("?", ""),
                    })
                );
                setReturnTypes(returnParams);
            }
        }
    }, [model]);

    return (
        <FormControl
            data-testid="log-form"
            className={formClasses.wizardFormControl}
        >
            <div className={formClasses.formTitleWrapper}>
                <div className={formClasses.mainTitleWrapper}>
                    <FunctionIcon color={"#CBCEDB"} />
                    <Typography variant="h4">
                        <Box paddingLeft={2} paddingY={2}>
                            Function
                        </Box>
                    </Typography>
                </div>
            </div>

            <div className={formClasses.sectionSeparator}>
                <Section>
                    <FormTextInput
                        label="Function Name"
                        dataTestId="function-name"
                        defaultValue={
                            model && STKindChecker.isFunctionDefinition(model)
                                ? model?.functionName?.value
                                : functionName
                        }
                        onChange={onFunctionNameChange}
                        placeholder="Enter function name"
                        customProps={{
                            isErrored: existingFunctionNames.current?.includes(
                                functionName
                            ),
                        }}
                        errorMessage="Function name already exists"
                    />
                </Section>
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
        </FormControl>
    );
}
