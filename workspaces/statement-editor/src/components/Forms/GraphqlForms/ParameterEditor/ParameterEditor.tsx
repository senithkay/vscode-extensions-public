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
import React, { useContext, useState } from "react";

import { LiteExpressionEditor, TypeBrowser } from "@wso2-enterprise/ballerina-expression-editor";
import { PrimaryButton, SecondaryButton } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import {
    DefaultableParam,
    IncludedRecordParam,
    RequiredParam,
    RestParam, STKindChecker
} from "@wso2-enterprise/syntax-tree";

import { StatementSyntaxDiagnostics, SuggestionItem } from "../../../../models/definitions";
import { FormEditorContext } from "../../../../store/form-editor-context";
import { FieldTitle } from "../../components/FieldTitle/fieldTitle";
import { createNewRecord } from "../../ResourceForm/util";

import { FunctionParameter } from "./ParameterField";
import { useStyles } from './style';

interface ParameterEditorProps {
    param?: (DefaultableParam | IncludedRecordParam | RequiredParam | RestParam);
    id?: number;
    segment?: FunctionParameter,
    onSave?: (segment: FunctionParameter) => void;
    onUpdate?: (segment: FunctionParameter) => void;
    onChange?: (segment: FunctionParameter) => void;
    syntaxDiag?: StatementSyntaxDiagnostics[];
    onCancel?: () => void;
    isEdit?: boolean;
    completions?: SuggestionItem[];
}

export function ParameterEditor(props: ParameterEditorProps) {
    const { param, segment, onSave, onUpdate, onChange, id, onCancel, syntaxDiag, isEdit, completions } = props;
    const classes = useStyles();
    const initValue: FunctionParameter = segment ? { ...segment } : {
        id: id ? id : 0,
        name: "name",
        type: "string"
    }

    const [segmentType, setSegmentType] = useState<string>(param?.typeName?.source.trim() || "string");
    const [segmentName, setSegmentName] = useState<string>(param?.paramName?.value.trim() || "name");
    const [defaultValue, setDefaultValue] = useState<string>(param && STKindChecker.isDefaultableParam(param) && param?.expression?.source.trim() || "");

    // States related to syntax diagnostics
    const [currentComponentName, setCurrentComponentName] = useState<string>("");

    const { applyModifications, syntaxTree, fullST } = useContext(FormEditorContext);
    const [newlyCreatedRecord, setNewlyCreatedRecord] = useState(undefined);

    const handleOnSave = () => {
        onSave({
            ...initValue,
            name: segmentName,
            type: segmentType,
            defaultValue
        });
    };

    const handleOnUpdate = () => {
        onUpdate({
            ...initValue,
            name: segmentName,
            type: segmentType,
            defaultValue
        });
    };

    const onTypeEditorFocus = () => {
        setCurrentComponentName("Type");
    }

    const handleOnTypeChange = (value: string) => {
        setSegmentType(value);
        onChange({
            ...initValue,
            name: segmentName,
            type: value,
            defaultValue
        });
    };

    const onNameEditorFocus = () => {
        setCurrentComponentName("Name");
    }

    const handleOnNameChange = (value: string) => {
        setSegmentName(value);
        onChange({
            ...initValue,
            name: value,
            type: segmentType,
            defaultValue
        });
    };

    const onDefaultValueEditorFocus = () => {
        setCurrentComponentName("DefaultValue");
    };

    const handleDefaultValueChange = (value: string) => {
        setDefaultValue(value);
        const type = param.typeName.source.trim();
        const paramName = param.paramName.value;
        onChange({
            ...initValue,
            name: paramName,
            type,
            defaultValue: value
        });
    }

    // TODO: logics must be changes according to the graphql requirement
    const createRecord = (newRecord: string) => {
        if (newRecord) {
            createNewRecord(newRecord, syntaxTree, applyModifications)
            setNewlyCreatedRecord(newRecord);
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
                        recordCompletions={completions}
                        createNew={createRecord}
                        diagnostics={syntaxDiag?.filter(diag => diag?.message.includes("unknown type"))}
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
                    text={onUpdate ? "Update" : " Add"}
                    disabled={
                        (syntaxDiag?.length > 0)
                        || (param?.viewState?.diagnosticsInRange?.length > 0)
                        || segmentName.length === 0
                        || segmentType.length === 0
                    }
                    fullWidth={false}
                    onClick={onUpdate ? handleOnUpdate : handleOnSave}
                />
            </div>
        </div>
    );
}
