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

import React, {useEffect, useState} from 'react';

import debounce from "lodash.debounce";

import { PrimaryButton, SecondaryButton } from "../buttons";
import { SelectDropdownWithButton } from "../DropDown/SelectDropdownWithButton";
import { FormTextInput } from "../FormTextInput";

import { useStyles } from "./style";
import { FormEditorField } from "./Types";

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
    optionList?: string[];
    option?: string;
    onAdd?: (param: Param, selectedOption?: string) => void;
    onUpdate?: (param: Param, selectedOption?: string) => void;
    onChange: (param: Param, selectedOption?: string, optionChanged?: boolean) => void;
    onCancel: () => void;
}

export function ParamEditor(props: ParamProps) {
    const { param, typeDiagnostics, nameDiagnostics, syntaxDiag, isEdit = true, optionList, option = "", onChange,
            onAdd, onUpdate, onCancel } = props;
    const { id, name, dataType } = param;

    const classes = useStyles();

    const [paramDataType, setParamDataType] = useState<FormEditorField>({value: dataType, isInteracted: false});
    const [paramName, setParamName] = useState<FormEditorField>({value: name, isInteracted: false});
    const [selectedOption, setSelectedOption] = useState<string>(option);
    // States related to syntax diagnostics
    const [currentComponentName, setCurrentComponentName] = useState<string>("");

    const handleNameChange = (value: string) => {
        setParamName({value, isInteracted: true});
        setCurrentComponentName("Name");
        if (optionList) {
            onChange({id, name: value, dataType: paramDataType.value}, selectedOption);
        } else {
            onChange({id, name: value, dataType: paramDataType.value});
        }
    };
    const debouncedNameChange = debounce(handleNameChange, 500);

    const handleTypeChange = (value: string) => {
        setParamDataType({value, isInteracted: true});
        setCurrentComponentName("Type");
        if (optionList) {
            onChange({id, name: paramName.value, dataType: value}, selectedOption);
        } else {
            onChange({id, name: paramName.value, dataType: value});
        }
    };
    const debouncedTypeChange = debounce(handleTypeChange, 500);

    const handleOnSelect = (value: string) => {
        setSelectedOption(value);
        onChange({id, name: paramName.value, dataType: paramDataType.value}, value, true);
    };

    const handleAddParam = () => {
        if (onUpdate) {
            if (optionList) {
                onUpdate({id, name: paramName.value, dataType: paramDataType.value}, selectedOption);
            } else {
                onUpdate({id, name: paramName.value, dataType: paramDataType.value});
            }
        } else {
            if (optionList) {
                onAdd({id, name: paramName.value, dataType: paramDataType.value}, selectedOption);
            } else {
                onAdd({id, name: paramName.value, dataType: paramDataType.value});
            }
        }
    };

    useEffect(() => {
        setParamDataType({value: dataType, isInteracted: false});
    }, [dataType]);

    useEffect(() => {
        setParamName({value: name, isInteracted: false});
    }, [name]);

    return (
        <div className={classes.paramContainer}>
            <div className={classes.paramContent}>
                {optionList && (
                    <div className={classes.paramTypeWrapper}>
                        <SelectDropdownWithButton
                            dataTestId="param-type-selector"
                            defaultValue={selectedOption}
                            placeholder={"Select Type"}
                            customProps={{ values: optionList, disableCreateNew: true }}
                            onChange={handleOnSelect}
                            label="Param Type"
                        />
                    </div>
                )}
                {dataType && (
                    <div className={classes.paramItemWrapper}>
                        <FormTextInput
                            label="Data Type"
                            dataTestId="data-type"
                            defaultValue={(paramDataType?.isInteracted || isEdit) ? paramDataType.value : ""}
                            onChange={debouncedTypeChange}
                            onBlur={null}
                            customProps={{
                                isErrored: ((syntaxDiag !== "" && currentComponentName === "Type") ||
                                    (typeDiagnostics !== "" && typeDiagnostics !== undefined))
                            }}
                            errorMessage={(currentComponentName === "Name" && syntaxDiag) || typeDiagnostics}
                            placeholder={"Type"}
                            size="small"
                            disabled={syntaxDiag && currentComponentName !== "Type"}
                        />
                    </div>
                )}
                <div className={classes.paramItemWrapper}>
                    <FormTextInput
                        label="Name"
                        dataTestId="param-name"
                        defaultValue={(paramName?.isInteracted || isEdit) ? paramName.value : ""}
                        onChange={debouncedNameChange}
                        customProps={{
                            isErrored: ((syntaxDiag !== "" && currentComponentName === "Name") ||
                                (nameDiagnostics !== "" && nameDiagnostics !== undefined))
                        }}
                        errorMessage={(currentComponentName === "Name" && syntaxDiag) || nameDiagnostics}
                        onBlur={null}
                        placeholder={"name"}
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
                    // disabled={!segmentState.name || segmentState.name === "" || (segmentState.isParam && (!segmentState.type || segmentState.type === "" || !validSelectedType)) || pathError !== ""}
                    fullWidth={false}
                    onClick={handleAddParam}
                    className={classes.actionBtn}
                />
            </div>
        </div>
    );
}
