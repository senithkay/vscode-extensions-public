/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import { VSCodeCheckbox } from "@vscode/webview-ui-toolkit/react";
import { EnableCondition, ParamConfig, ParamManager } from "./ParamManager";
import { ExpressionField, ExpressionFieldValue } from "../ExpressionField/ExpressionInput";
import { AutoComplete, Dropdown, TextArea, TextField } from "@wso2-enterprise/ui-toolkit";
import { FilterType, Keylookup } from "../Keylookup/Keylookup";
import styled from "@emotion/styled";

const ParamManagerContainer = styled.div`
    display: flex;
    margin: 10px 0;
    flex-direction: column;
    border-radius: 5px;
    padding: 10px;
    border: 1px solid var(--vscode-dropdown-border);
`;

export interface Param {
    id: number;
    label: string;
    type: "TextField" | "Dropdown" | "Checkbox" | "TextArea" | "ExprField" | "AutoComplete" | "KeyLookup"| "ParamManager";
    value: string | boolean | ExpressionFieldValue | ParamConfig; // Boolean is for Checkbox
    isRequired?: boolean;
    errorMessage?: string;
    disabled?: boolean;
    isEnabled?: boolean;
    nullable?: boolean;
    allowItemCreate?: boolean;
    noItemsFoundMessage?: string;
    enableCondition?: EnableCondition;
    filter?: (value: string) => boolean; // For KeyLookup
    filterType?: FilterType; // For KeyLookup
    values?: string[]; // For Dropdown
    openExpressionEditor?: () => void; // For ExpressionField
    canChange?: boolean; // For ExpressionField
}

interface TypeResolverProps {
    param: Param;
    onChange: (param: Param, ec?: EnableCondition) => void;
}

export function TypeResolver(props: TypeResolverProps) {
    const { param, onChange } = props;
    const { id, label, type, value, isRequired, values, disabled, errorMessage, openExpressionEditor,
        canChange, allowItemCreate, noItemsFoundMessage, nullable, filter, filterType } = param;

    const handleOnChange = (newValue: string | boolean) => {
        onChange({ ...param, value: newValue }, param.enableCondition);
    }

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange({ ...param, value: e.target.checked }, param.enableCondition);
    }

    const dropdownItems = values?.map(val => {
        return { value: val };
    });

    if (param.enableCondition && !param.isEnabled) {
        return null;
    }
    switch (type) {
        case "TextField":
            return (
                <TextField
                    sx={{ marginBottom: 5 }}
                    id={`txt-field-${id}`}
                    label={label}
                    value={value as string}
                    disabled={disabled}
                    errorMsg={errorMessage}
                    required={isRequired}
                    onTextChange={handleOnChange}
                />
            );
        case "Dropdown":
            return (
                <Dropdown
                    containerSx={{fontFamily: "var(--vscode-font-family)", fontSize: "var(--vscode-font-size)", marginBottom: 5}}
                    id={`dropdown-${id}`}
                    label={label}
                    value={value as string}
                    items={dropdownItems}
                    disabled={disabled}
                    errorMsg={errorMessage}
                    isRequired={isRequired}
                    onValueChange={handleOnChange}
                />
            );
        case "Checkbox":
            return (
                <div style={{ marginBottom: 5 }}>
                    <VSCodeCheckbox
                        id={`checkbox-${id}`}
                        checked={value as boolean}
                        onChange={handleCheckboxChange}
                        disabled={disabled}
                    >
                        Is Required?
                    </VSCodeCheckbox>
                </div>
            );
        case "TextArea":
            return (
                <TextArea
                    sx={{marginBottom: 5}}
                    id={`txt-area-${id}`}
                    value={value as string}
                    disabled={disabled}
                    label={label}
                    errorMsg={errorMessage}
                    onTextChange={handleOnChange}
                />
            );
        case "ExprField":
            return (
                <ExpressionField
                    sx={{ marginBottom: 5 }}
                    id={`txt-area-${id}`}
                    value={value as ExpressionFieldValue}
                    openExpressionEditor={openExpressionEditor}
                    disabled={disabled}
                    label={label}
                    errorMsg={errorMessage}
                    onChange={handleOnChange}
                    canChange={canChange}
                />
            );
        case "AutoComplete":
            return (
                <AutoComplete
                    sx={{marginBottom: 5}}
                    id={`auto-complete-${id}`}
                    label={label}
                    value={value as string}
                    required={isRequired}
                    onValueChange={handleOnChange}
                    items={values}
                    allowItemCreate={allowItemCreate}
                    nullable={nullable}
                    notItemsFoundMessage={noItemsFoundMessage}
                />
            );
        case "KeyLookup":
            return (
                <Keylookup
                    sx={{marginBottom: 5}}
                    id={`key-lookup-${id}`}
                    label={label}
                    value={value as string}
                    required={isRequired}
                    onValueChange={handleOnChange}
                    allowItemCreate={allowItemCreate}
                    nullable={nullable}
                    notItemsFoundMessage={noItemsFoundMessage}
                    filter={filter}
                    filterType={filterType}
                />
            );
        case "ParamManager":
            return (
                <ParamManagerContainer>
                    <ParamManager
                        paramConfigs={value as ParamConfig}
                        onChange={(newParams: ParamConfig) => {
                            onChange({ ...param, value: newParams });
                        }}
                    />
                </ParamManagerContainer>
            );
        default:
            return null;
    }
}
