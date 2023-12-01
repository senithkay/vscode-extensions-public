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
import { ParameterConfig } from './ParamItem';

export const headerParameterOption = "Header";


export enum PARAM_TYPES {
    DEFAULT = 'Query',
    PAYLOAD = 'Payload',
    REQUEST = 'Request',
    CALLER = 'Caller',
    HEADER = 'Header',
}

const ParamContainer = styled.div`
    display: flex;
    flex-direction: column;
    border-radius: 5px;
    padding: 10px;
    border: 1px solid var(--vscode-dropdown-border)
`;

const ParamContent = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    padding: 10px 0;
`;

// const Payload = styled.div`
//     margin: 0 0 8px;
//     font-size: 14px;
//     font-family: "Gilmer";
//     font-weight: 600;
//     line-height: 1rem;
//     letter-spacing: normal;
//     padding-bottom: 0.6rem;
//     text-transform: capitalize;
// `;

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

    const handleOnSelect = (value: string) => {
        setSelectedOption(value as PARAM_TYPES);
    };

    const onTypeChange = (value: string) => {
        setType(value);
    };

    const onNameChange = (value: string) => {
        setNameValue(value);
    };

    const onDefaultValueChange = (value: string) => {
        setDefaultValue(value);
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
        };
        onChange(newParam);
    };
    // const hideParamType = false;
    // const subTitle = PARAM_TYPES.CALLER;
    // switch (option) {
    //     case PARAM_TYPES.CALLER:
    //         hideParamType = true;
    //         subTitle = PARAM_TYPES.CALLER;
    //         break;
    //     case PARAM_TYPES.HEADER:
    //         hideParamType = true;
    //         subTitle = PARAM_TYPES.HEADER;
    //         break;
    //     case PARAM_TYPES.REQUEST:
    //         hideParamType = true;
    //         subTitle = PARAM_TYPES.REQUEST;
    //         break;
    //     case PARAM_TYPES.PAYLOAD:
    //         hideParamType = true;
    //         subTitle = PARAM_TYPES.PAYLOAD;
    //         break;
    //     default:
    //         hideParamType = false;
    //         subTitle = "";
    // }

    const options = [{ id: "0", value: PARAM_TYPES.DEFAULT }, { id: "1", value: PARAM_TYPES.HEADER }];

    return (
        <ParamContainer>
            {/* {hideParamType && <Payload> {subTitle} </Payload>} */}
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
                    // sx={{paddingRight: 10}}
                    size={21}
                    label='Type'
                    required
                    placeholder='Enter type'
                    value={type}
                    onChange={onTypeChange}
                />
                <TextField
                    // sx={{paddingRight: 10}}
                    label='Name'
                    size={21}
                    required
                    placeholder='Enter name'
                    value={name}
                    onChange={onNameChange}
                />
                <TextField
                    label='Default Value'
                    size={21}
                    placeholder='Enter default value'
                    value={defaultValue}
                    onChange={onDefaultValueChange}
                />
            </ParamContent>
            <ActionButtons
                primaryButton={{ text : "Save", onClick: handleOnSave }}
                secondaryButton={{ text : "Cancel", onClick: handleOnCancel }}
                sx={{justifyContent: "flex-end"}}
            />
            {/* <ParamNameWrapper>
                <TextField 
                    label='Name'
                    required
                    placeholder='Enter name'
                    value={param.name}
                />
            </ParamNameWrapper>
            <ParamNameWrapper>
                <TextField 
                    label='Default Value'
                    placeholder='Enter default value'
                    value={param.defaultValue}
                />
            </ParamNameWrapper> */}
            {/* <div className={classes.paramContent}>
                {!(model.parameterValue.includes(RESOURCE_CALLER_TYPE)
                    || model.parameterValue.includes(RESOURCE_REQUEST_TYPE)
                    || model.parameterValue.includes(RESOURCE_HEADER_MAP_TYPE)) && (
                        <div className={classes.paramDataTypeWrapper}>
                            <FieldTitle title='Type' optional={false} />
                            <TypeBrowser
                                type={typeValue}
                                onChange={handleTypeChange}
                                isLoading={false}
                                recordCompletions={completions}
                                createNew={createRecord}
                                diagnostics={syntaxDiagnostics?.filter(diag =>
                                    diag?.message.includes(typeValue) && !diag?.message.includes("expected")
                                )}
                            />
                        </div>
                    )}
                <div className={classes.paramNameWrapper}>
                    <FieldTitle title='Name' optional={false} />
                    <LiteTextField
                        onChange={handleNameChange}
                        value={inputValue}
                        isLoading={false}
                        onFocus={onNameEditorFocus}
                        diagnostics={syntaxDiagnostics?.filter(diag => diag?.message.includes(inputValue))}
                    />
                </div>
                {
                    !(model.parameterValue.includes(RESOURCE_CALLER_TYPE)
                        || model.parameterValue.includes(RESOURCE_REQUEST_TYPE)
                        || model.parameterValue.includes(RESOURCE_HEADER_MAP_TYPE)) && (
                        <div className={classes.paramNameWrapper}>
                            <FieldTitle title='Default Value' optional={true} />
                            <LiteTextField
                                onChange={handleDefaultValueChange}
                                value={defaultParamValue}
                                isLoading={false}
                                onFocus={onDefaultValueEditorFocus}
                                diagnostics={
                                    defaultParamValue &&
                                    syntaxDiagnostics?.filter(diag => diag?.message.includes("expected") || diag?.message.includes(defaultParamValue))
                                }
                            />
                        </div>
                    )
                }
            </div>
            {option === PARAM_TYPES.DEFAULT &&
                (
                <div className={classes.paramContent}>
                    <CheckBoxGroup
                        values={["Is Required"]}
                        defaultValues={isRequired ? ["Is Required"] : []}
                        onChange={handleIsRequired}
                    />
                </div>
                )
            }
            {
                model.parameterValue.includes(RESOURCE_CALLER_TYPE)
                && syntaxDiagnostics?.filter(diag => diag?.message.includes("Caller"))
                &&
                (
                <div className={classes.invalidCode}>
                    {syntaxDiagnostics[0]?.message}
                </div>
                )
            } */}
            {/* <div className={classes.btnContainer}>
                <SecondaryButton
                    text="Cancel"
                    fullWidth={false}
                    onClick={handleOnCancel}
                    className={classes.actionBtn}
                />
                <PrimaryButton
                    dataTestId={"path-segment-add-btn"}
                    text={"Save"}
                    disabled={
                        (syntaxDiagnostics && syntaxDiagnostics.length > 0)
                    }
                    fullWidth={false}
                    onClick={handleOnSave}
                    className={classes.actionBtn}
                />
            </div> */}
        </ParamContainer >
    );
}
