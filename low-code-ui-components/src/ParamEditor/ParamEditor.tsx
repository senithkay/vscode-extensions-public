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

import React, { useState } from 'react';

import { LiteExpressionEditor, SuggestionItem } from '@wso2-enterprise/ballerina-expression-editor';
import { DefaultableParam, IncludedRecordParam, RequiredParam, RestParam, STKindChecker, STNode } from '@wso2-enterprise/syntax-tree';
import debounce from "lodash.debounce";

import { PrimaryButton, SecondaryButton } from '../buttons';
import { ParamDropDown } from "../DropDown/ParamDropdown";
import { FieldTitle } from '../FieldTitle';

import { useStyles } from "./style";

export interface Param {
    id: number;
    type?: string;
    name: string;
}


export enum PARAM_TYPES {
    DEFAULT = 'Query',
    PAYLOAD = 'Payload',
    REQUEST = 'Request',
    CALLER = 'Caller'
}

export interface ParamProps {
    // param: Param;
    // syntaxDiag?: string;
    // typeDiagnostics?: string;
    // nameDiagnostics?: string;
    // isEdit?: boolean;
    // isTypeReadOnly?: boolean;
    // dataTypeReqOptions: string[];
    paramIndex: number;
    onSave: (param: Param, selectedOption?: string) => void;
    // onUpdate?: (param: Param, selectedOption?: string) => void;
    model: DefaultableParam | IncludedRecordParam | RequiredParam | RestParam;
    onChange: (param: Param, selectedOption?: string, optionChanged?: boolean, model?: STNode) => void;
    onCancel: () => void;
    enabledOptions?: string[];
    optionList?: string[];
    option?: string;
    completions: SuggestionItem[];
}

export function ParamEditor(props: ParamProps) {
    const { model, onSave, onChange, onCancel, enabledOptions, option, optionList, paramIndex, completions } = props;

    const classes = useStyles();

    const [selectedOption, setSelectedOption] = useState<string>(option);
    const [currentComponentName, setCurrentComponentName] = useState<string>("");

    const handleNameChange = (value: string) => {
        setCurrentComponentName("Name");
        onChange({ id: paramIndex, name: value, type: model.typeName.source.trim() }, selectedOption, false, model.paramName);
    };
    const debouncedNameChange = debounce(handleNameChange, 800);

    const handleTypeChange = (value: string) => {
        setCurrentComponentName("Type");
        onChange({ id: paramIndex, name: model.paramName.value.trim(), type: value }, selectedOption, false, model.typeName);
    };
    const debouncedTypeChange = debounce(handleTypeChange, 800);

    const handleOnSelect = (value: string) => {
        setSelectedOption(value);
        onChange({ id: paramIndex, name: model.paramName.value.trim(), type: model.typeName.source.trim() }, value, true);
    };

    const handleAddParam = () => {
        onSave({ id: paramIndex, name: model.paramName.value.trim(), type: model.typeName.source.trim() }, selectedOption);
    };

    const textInputComponents: JSX.Element[] = [];


    const handleOnChange = (value: string) => {
        // haha
    }

    const handleOnFocus = () => {
        // haha
    }
    if (STKindChecker.isRequiredParam(model)) {
        textInputComponents.push((
            <>
                <div className={classes.paramDataTypeWrapper}>
                    <FieldTitle title='Type' optional={false} />
                    <LiteExpressionEditor
                        diagnostics={model.typeName.viewState?.diagnosticsInRange}
                        defaultValue={model.typeName.source.trim()}
                        onChange={handleOnChange}
                        completions={currentComponentName === 'Type' ? completions : []}
                        onFocus={handleOnFocus}
                        disabled={false}
                        customProps={{
                            index: 1,
                            optional: true
                        }}
                    />
                </div>
                <div className={classes.paramNameWrapper}>
                    <FieldTitle title='Name' optional={false} />
                    <LiteExpressionEditor
                        diagnostics={model.paramName?.viewState?.diagnosticsInRange}
                        defaultValue={model.paramName.value.trim()}
                        onChange={handleOnChange}
                        completions={currentComponentName === 'Name' ? completions : []}
                        onFocus={handleOnFocus}
                        disabled={false}
                        customProps={{
                            index: 1,
                            optional: true
                        }}
                    />
                </div>
            </>
        ));
    }

    return (
        <div className={classes.paramContainer}>
            <div className={classes.paramContent}>
                <div className={classes.paramTypeWrapper}>
                    <ParamDropDown
                        dataTestId="param-type-selector"
                        defaultValue={option}
                        placeholder={"Select Type"}
                        customProps={{ values: optionList, enabledValues: enabledOptions }}
                        onChange={handleOnSelect}
                        label="Param Type"
                    />
                </div>
                {textInputComponents}
            </div>
            <div className={classes.btnContainer}>
                <SecondaryButton
                    text="Cancel"
                    fullWidth={false}
                    onClick={onCancel}
                    className={classes.actionBtn}
                />
                <PrimaryButton
                    dataTestId={"path-segment-add-btn"}
                    text={"Save"}
                    disabled={false}
                    fullWidth={false}
                    onClick={handleAddParam}
                    className={classes.actionBtn}
                />
            </div>
        </div>
    );
}
