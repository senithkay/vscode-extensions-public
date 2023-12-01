/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js

import React from 'react';

import styled from '@emotion/styled';
import { ActionButtons, Dropdown, TextField } from '@wso2-enterprise/ui-toolkit';
import { VSCodeCheckbox } from "@vscode/webview-ui-toolkit/react";
import { PARAM_TYPES, ParameterConfig } from '../../definitions';

const options = [{ id: "0", value: PARAM_TYPES.DEFAULT }, { id: "1", value: PARAM_TYPES.HEADER }];

const ParamContainer = styled.div`
    display: flex;
    margin: 10px 0;
    flex-direction: column;
    border-radius: 5px;
    padding: 10px;
    border: 1px solid var(--vscode-dropdown-border);
`;

const ParamContent = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 10px 0;
`;

export interface ParamProps {
    param: ParameterConfig;
    isEdit: boolean;
    optionList?: PARAM_TYPES[];
    option?: PARAM_TYPES;
    isTypeReadOnly?: boolean;
    onChange: (param: ParameterConfig) => void;
    onCancel?: (id?: number) => void;
}

export function ParamEditor(props: ParamProps) {
    const { param, option, optionList, onChange, onCancel } = props;

    const [selectedOption, setSelectedOption] = React.useState(option);
    const [name, setNameValue] = React.useState(param.name);
    const [type, setType] = React.useState(param.type);
    const [defaultValue, setDefaultValue] = React.useState(param.defaultValue);
    const [isSelected, setIsSelected] = React.useState(param.isRequired);

    const handleOnSelect = (value: string) => {
        setSelectedOption(value as PARAM_TYPES);
    };

    const handleTypeChange = (value: string) => {
        setType(value);
    };

    const handleChange = (value: string) => {
        setNameValue(value);
    };

    const handleValueChange = (value: string) => {
        setDefaultValue(value);
    };

    const handleReqFieldChange = () => {
        setIsSelected(!isSelected);
    };

    const handleOnCancel = () => {
        onCancel(param.id);
    };

    const handleOnSave = () => {
        const newParam: ParameterConfig = {
            id: param.id,
            name,
            type,
            option: selectedOption,
            defaultValue,
            isRequired: isSelected
        };
        onChange(newParam);
    };

    return (
        <ParamContainer>
            {optionList && (
                <Dropdown
                    id="param-type-selector"
					sx={{width: 172}}
					isRequired
					errorMsg=""
					items={options}
					label="Param Type"
					onChange={handleOnSelect}
					value={selectedOption}
				/>
            )}
            <ParamContent>
                <TextField
                    size={21}
                    label='Type'
                    required
                    placeholder='Enter type'
                    value={type}
                    onChange={handleTypeChange}
                />
                <TextField
                    label='Name'
                    size={21}
                    required
                    placeholder='Enter name'
                    value={name}
                    onChange={handleChange}
                />
                <TextField
                    label='Default Value'
                    size={21}
                    placeholder='Enter default value'
                    value={defaultValue}
                    onChange={handleValueChange}
                />
            </ParamContent>
            <VSCodeCheckbox checked={isSelected} onChange={handleReqFieldChange} id="is-req-checkbox">
                Is Required?
            </VSCodeCheckbox>
            <ActionButtons
                primaryButton={{ text : "Save", onClick: handleOnSave }}
                secondaryButton={{ text : "Cancel", onClick: handleOnCancel }}
                sx={{justifyContent: "flex-end"}}
            />
        </ParamContainer >
    );
}
