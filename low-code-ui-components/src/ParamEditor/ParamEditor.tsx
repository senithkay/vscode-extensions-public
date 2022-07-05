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

import debounce from "lodash.debounce";

import { PrimaryButton, SecondaryButton } from "../buttons";
import { ParamDropDown } from "../DropDown/ParamDropdown";
import { FormTextInput } from "../FormTextInput";

import { useStyles } from "./style";

export interface Param {
    id: number;
    dataType?: string;
    name: string;
}

export interface ParamProps {
    param: Param;
    syntaxDiag?: string;
    typeDiagnostics?: string;
    nameDiagnostics?: string;
    isEdit?: boolean;
    isTypeReadOnly?: boolean;
    dataTypeReqOptions: string[];
    enabledOptions?: string[];
    optionList?: string[];
    option?: string;
    onAdd?: (param: Param, selectedOption?: string) => void;
    onUpdate?: (param: Param, selectedOption?: string) => void;
    onChange: (param: Param, selectedOption?: string, optionChanged?: boolean) => void;
    onCancel: () => void;
}

export function ParamEditor(props: ParamProps) {
    const { param, typeDiagnostics, nameDiagnostics, syntaxDiag, isEdit, isTypeReadOnly, optionList, enabledOptions,
            dataTypeReqOptions, option = "", onChange, onAdd, onUpdate, onCancel } = props;
    const { id, name, dataType } = param;

    const classes = useStyles();

    const [paramDataType, setParamDataType] = useState<string>(dataType);
    const [paramName, setParamName] = useState<string>(name);
    const [selectedOption, setSelectedOption] = useState<string>(option);
    // States related to syntax diagnostics
    const [currentComponentName, setCurrentComponentName] = useState<string>("");

    const isTypeVisible = dataTypeReqOptions.includes(selectedOption);

    const handleNameChange = (value: string) => {
        setParamName(value);
        setCurrentComponentName("Name");
        if (optionList) {
            onChange({id, name: value, dataType: paramDataType}, selectedOption);
        } else {
            onChange({id, name: value, dataType: paramDataType});
        }
    };
    const debouncedNameChange = debounce(handleNameChange, 800);

    const handleTypeChange = (value: string) => {
        setParamDataType(value);
        setCurrentComponentName("Type");
        if (optionList) {
            onChange({id, name: paramName, dataType: value}, selectedOption);
        } else {
            onChange({id, name: paramName, dataType: value});
        }
    };
    const debouncedTypeChange = debounce(handleTypeChange, 800);

    const handleOnSelect = (value: string) => {
        setSelectedOption(value);
        onChange({id, name: paramName, dataType: paramDataType}, value, true);
    };

    const handleAddParam = () => {
        if (onUpdate) {
            if (optionList) {
                onUpdate({id, name: paramName, dataType: paramDataType}, selectedOption);
            } else {
                onUpdate({id, name: paramName, dataType: paramDataType});
            }
        } else {
            if (optionList) {
                onAdd({id, name: paramName, dataType: paramDataType}, selectedOption);
            } else {
                onAdd({id, name: paramName, dataType: paramDataType});
            }
        }
    };

    useEffect(() => {
        setParamDataType(dataType);
    }, [dataType]);

    useEffect(() => {
        setParamName(name);
    }, [name]);

    useEffect(() => {
        setSelectedOption(option);
    }, [option]);

    return (
        <div className={classes.paramContainer}>
            <div className={classes.paramContent}>
                {optionList && (
                    <div className={classes.paramTypeWrapper}>
                        <ParamDropDown
                            dataTestId="param-type-selector"
                            defaultValue={selectedOption}
                            placeholder={"Select Type"}
                            customProps={{ values: optionList, enabledValues: enabledOptions }}
                            onChange={handleOnSelect}
                            label="Param Type"
                        />
                    </div>
                )}
                {isTypeVisible && (
                    <div className={classes.paramDataTypeWrapper}>
                        <FormTextInput
                            label="Data Type"
                            dataTestId="data-type"
                            defaultValue={paramDataType}
                            onChange={debouncedTypeChange}
                            onBlur={null}
                            customProps={{
                                isErrored: (syntaxDiag !== "" && currentComponentName === "Type")
                                    || (typeDiagnostics !== "" && typeDiagnostics !== undefined),
                                readonly: isTypeReadOnly
                            }}
                            errorMessage={((currentComponentName === "Type" && syntaxDiag ? syntaxDiag : "")
                                || typeDiagnostics)}
                            placeholder={"Enter Type"}
                            size="small"
                            disabled={syntaxDiag && currentComponentName !== "Type"}
                        />
                    </div>
                )}
                <div className={classes.paramNameWrapper}>
                    <FormTextInput
                        label="Name"
                        dataTestId="param-name"
                        defaultValue={paramName}
                        onChange={debouncedNameChange}
                        customProps={{
                            isErrored: ((syntaxDiag !== "" && currentComponentName === "Name") ||
                                (nameDiagnostics !== "" && nameDiagnostics !== undefined))
                        }}
                        errorMessage={((currentComponentName === "Name" && (syntaxDiag) ? syntaxDiag : "")
                            || nameDiagnostics)}
                        onBlur={null}
                        placeholder={"Enter Name"}
                        size="small"
                        disabled={syntaxDiag && currentComponentName !== "Name"}
                    />
                </div>
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
                    text={onUpdate ? "Update" : " Add"}
                    disabled={(syntaxDiag !== "") || (typeDiagnostics !== "") || (nameDiagnostics !== "")
                        || !(paramName !== "") || !(paramDataType !== "" || isTypeReadOnly || !isTypeVisible)
                    }
                    fullWidth={false}
                    onClick={handleAddParam}
                    className={classes.actionBtn}
                />
            </div>
        </div>
    );
}
