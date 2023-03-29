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

import { LiteExpressionEditor, TypeBrowser } from "@wso2-enterprise/ballerina-expression-editor";
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
    const [defaultValue, setDefaultValue] = useState<string>(param && STKindChecker.isDefaultableParam(param) && param?.expression?.source.trim() || "");

    // States related to syntax diagnostics
    const [currentComponentName, setCurrentComponentName] = useState<string>("");

    const { applyModifications, fullST } = useContext(FormEditorContext);

    const [newlyCreatedConstruct, setNewlyCreatedConstruct] = useState(undefined);

    useEffect(() => {
        if (newlyCreatedConstruct) {
            handleOnTypeChange(newlyCreatedConstruct);
        }
    }, [fullST]);

    const createConstruct = (newCodeSnippet: string) => {
        if (newCodeSnippet) {
            createNewConstruct(newCodeSnippet, fullST, applyModifications)
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
        onChange(
            {
                id,
                type: segmentType,
                name: segmentName,
                defaultValue: value
            },
            param,
            value
        )
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
                        recordCompletions={completions ? completions : []} // TODO handle empty completions from top level
                        createNew={createConstruct}
                        diagnostics={syntaxDiag?.filter(diag => diag?.message.includes("unknown type"))}
                        isGraphqlForm={true}
                    />
                </div>
                <div className={classes.paramNameWrapper}>
                    <FieldTitle title='Name' optional={false} />
                    <LiteExpressionEditor
                        testId="param-name"
                        diagnostics={
                            (syntaxDiag && currentComponentName === "Name" && syntaxDiag) ||
                            param?.paramName?.viewState?.diagnosticsInRange
                        }
                        defaultValue={segmentName}
                        onChange={handleOnNameChange}
                        onFocus={onNameEditorFocus}
                        disabled={false}
                        completions={completions}
                    />
                </div>
                <div className={classes.paramNameWrapper}>
                    <FieldTitle title='Default Value' optional={true} />
                    <LiteExpressionEditor
                        testId="param-default-val"
                        diagnostics={
                            (currentComponentName === "DefaultValue" && syntaxDiag)
                            || param && STKindChecker.isDefaultableParam(param) && param.expression?.viewState?.diagnosticInRange
                            || []
                        }
                        defaultValue={
                            (param && STKindChecker.isDefaultableParam(param) && param.expression?.source.trim())
                            || ""
                        }
                        onChange={handleDefaultValueChange}
                        onFocus={onDefaultValueEditorFocus}
                        disabled={false}
                        completions={
                            currentComponentName === "DefaultValue" && completions
                        }
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
                    disabled={
                        (syntaxDiag?.length > 0)
                        || (param?.viewState?.diagnosticsInRange?.length > 0)
                        || segmentName?.length === 0
                        || segmentType?.length === 0
                    }
                    fullWidth={false}
                    onClick={handleOnSave}
                />
            </div>
        </div>
    );
}
