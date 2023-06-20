/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import React, { useContext, useEffect, useState } from "react";

import { LiteTextField, TypeBrowser } from "@wso2-enterprise/ballerina-expression-editor";
import { PrimaryButton, SecondaryButton } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import {
    DefaultableParam,
    IncludedRecordParam,
    RequiredParam,
    RestParam, STKindChecker, STNode
} from "@wso2-enterprise/syntax-tree";

import { StatementSyntaxDiagnostics, SuggestionItem } from "../../../../models/definitions";
import { FormEditorContext } from "../../../../store/form-editor-context";
import { FieldTitle } from "../../components/FieldTitle/fieldTitle";
import { createNewConstruct } from "../../ResourceForm/util";

import { FunctionParameter } from "./ParameterField";
import { useStyles } from './style';

interface ParameterEditorProps {
    param?: (DefaultableParam | IncludedRecordParam | RequiredParam | RestParam);
    id?: number;
    onSave?: (parameter: FunctionParameter, focusedModel?: STNode, typedInValue?: string) => void;
    onChange?: (parameter: FunctionParameter, focusedModel?: STNode, typedInValue?: string) => void;
    syntaxDiag?: StatementSyntaxDiagnostics[];
    onCancel?: () => void;
    isEdit?: boolean;
    completions?: SuggestionItem[];
}
// TODO : Add the logic to handle the syntax diagnostics and typeBrowser with suggestions for new constructs
export function ParameterEditor(props: ParameterEditorProps) {
    const { param, onSave, onChange, id, onCancel, syntaxDiag, isEdit, completions } = props;
    const classes = useStyles();

    const [segmentType, setSegmentType] = useState<string>(param?.typeName?.source.trim() || "string");
    const [segmentName, setSegmentName] = useState<string>(param?.paramName?.value.trim() || "name");
    const [defaultValue, setDefaultValue] = useState<string>((param && STKindChecker.isDefaultableParam(param) && param?.expression?.source.trim()) || "");

    // States related to syntax diagnostics
    const [currentComponentName, setCurrentComponentName] = useState<string>("");

    const { applyModifications, fullST, currentFile } = useContext(FormEditorContext);

    const [newlyCreatedConstruct, setNewlyCreatedConstruct] = useState(undefined);

    useEffect(() => {
        if (newlyCreatedConstruct) {
            handleOnTypeChange(newlyCreatedConstruct);
        }
    }, [fullST]);

    const createConstruct = (newCodeSnippet: string) => {
        if (newCodeSnippet) {
            createNewConstruct(newCodeSnippet, fullST, applyModifications, currentFile.path)
            setNewlyCreatedConstruct(segmentType);
        }
    }

    const handleOnSave = () => {
        onSave(
            {
                id,
                type: segmentType,
                name: segmentName,
                defaultValue
            },
            param,
        );
    };

    const onTypeEditorFocus = () => {
        setCurrentComponentName("Type");
    }

    const handleOnTypeChange = (value: string) => {
        onTypeEditorFocus();
        setSegmentType(value);
        onChange(
            {
                id,
                type: value,
                name: segmentName,
                defaultValue
            },
            param,
            value
            )
    };

    const onNameEditorFocus = () => {
        setCurrentComponentName("Name");
    }

    const handleOnNameChange = (value: string) => {
        setSegmentName(value);
        onChange(
            {
                id,
                type: segmentType,
                name: value,
                defaultValue
            },
            param,
            value
        )
    };

    const onDefaultValueEditorFocus = () => {
        setCurrentComponentName("DefaultValue");
    };

    const handleDefaultValueChange = (value: string) => {
        setDefaultValue(value);
        const focusedModel = (param && STKindChecker.isDefaultableParam(param)) ? param.expression : undefined;
        onChange(
            {
                id,
                type: segmentType,
                name: segmentName,
                defaultValue: value
            },
            focusedModel,
            value
        )
    }

    const getDefaultComponentDiagnostic = () => {
        if (param) {
            if (currentComponentName === "DefaultValue" || currentComponentName === "") {
                if (STKindChecker.isDefaultableParam(param) && param.expression?.viewState?.diagnosticsInRange?.length > 0) {
                    return param.expression?.viewState?.diagnosticsInRange;
                } else if (param.parent?.viewState?.diagnosticsInRange?.length > 0) {
                    return param.parent?.viewState?.diagnosticsInRange;
                } else if (param.syntaxDiagnostics.length > 0) {
                    return param.syntaxDiagnostics;
                } else {
                    return syntaxDiag;
                }
            }
        } else {
            return syntaxDiag;
        }
    }

    const getNameComponentDiagnostic = () => {
        if (param) {
            if (currentComponentName === "Name" || currentComponentName === "") {
                if (param.paramName?.viewState?.diagnosticsInRange?.length > 0) {
                    return param.paramName?.viewState?.diagnosticsInRange;
                } else if (param.parent?.viewState?.diagnosticsInRange?.length > 0) {
                    return param.parent?.viewState?.diagnosticsInRange;
                } else if (param.syntaxDiagnostics.length > 0) {
                    return param.syntaxDiagnostics;
                } else {
                    return syntaxDiag;
                }
            }
        } else {
            return syntaxDiag;
        }
    }


    return (
        <div className={classes.paramContainer} >
            <div className={classes.paramContent}>
                <div className={classes.paramDataTypeWrapper}>
                    <FieldTitle title='Type' optional={false} />
                    <TypeBrowser
                        type={segmentType}
                        onChange={handleOnTypeChange}
                        isLoading={false}
                        recordCompletions={completions ? completions : []}
                        createNew={createConstruct}
                        diagnostics={param?.typeName?.viewState?.diagnosticsInRange?.length > 0 ?
                            param?.typeName?.viewState?.diagnosticsInRange :
                            (param?.viewState?.diagnosticsInRange)}
                        isGraphqlForm={true}
                        isParameterType={true}
                    />
                </div>
                <div className={classes.paramNameWrapper}>
                    <FieldTitle title='Name' optional={false} />
                    <LiteTextField
                        value={segmentName}
                        onChange={handleOnNameChange}
                        diagnostics={getNameComponentDiagnostic()}
                        isLoading={false}
                        onFocus={onNameEditorFocus}
                    />
                </div>
                <div className={classes.paramNameWrapper}>
                    <FieldTitle title='Default Value' optional={true} />
                    <LiteTextField
                        onChange={handleDefaultValueChange}
                        isLoading={false}
                        diagnostics={getDefaultComponentDiagnostic()}
                        value={defaultValue}
                        onFocus={onDefaultValueEditorFocus}
                    />
                </div>
            </div>
            <div className={classes.btnContainer}>
                <SecondaryButton
                    text="Cancel"
                    fullWidth={false}
                    onClick={onCancel}
                />
                <PrimaryButton
                    dataTestId={"param-save-btn"}
                    text={isEdit ? "Update" : " Add"}
                    disabled={syntaxDiag?.length > 0
                        || param?.typeName?.viewState?.diagnosticsInRange?.length > 0
                        || param?.paramName?.viewState?.diagnosticsInRange?.length > 0
                        || (param && STKindChecker.isDefaultableParam(param) && param?.expression?.viewState?.diagnosticInRange?.length > 0)
                        || param?.viewState?.diagnosticsInRange?.length > 0
                        || segmentName?.length === 0
                        || segmentType?.length === 0
                        || param?.parent?.viewState?.diagnosticsInRange?.length > 0
                    }
                    fullWidth={false}
                    onClick={handleOnSave}
                />
            </div>
        </div>
    );
}
