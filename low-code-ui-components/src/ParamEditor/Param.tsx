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

import debounce from "lodash.debounce";

import { SelectDropdownWithButton } from "../DropDown/SelectDropdownWithButton";
import { FormTextInput } from "../FormTextInput";

import { useStyles } from "./style";
import { FormEditorField } from "./Types";

export interface Param {
    id: number;
    type?: string;
    name: string;
}

export interface Props {
    param?: Param;
    isEdit?: boolean;
    optionList?: string[];
    option?: string;
    onSave: () => void;
    onChange: (param: Param, selectedOption?: string) => void;
    onCancel: () => void;
}

export function Param(props: Props) {
    const { param, isEdit = true, optionList, option, onChange, onSave, onCancel } = props;
    const { id, name, type } = param;

    const classes = useStyles();

    const [paramType, setParamType] = useState<FormEditorField>({value: type, isInteracted: false});
    const [paramName, setParamName] = useState<FormEditorField>({value: name, isInteracted: false});
    const [selectedOption, setSelectedOption] = useState<string>(option);

    const handleNameChange = (value: string) => {
        setParamName({value, isInteracted: true});
        if (optionList) {
            onChange({id, name: value, type: paramType.value}, selectedOption);
        } else {
            onChange({id, name: value, type: paramType.value});
        }
    };
    const debouncedNameChange = debounce(handleNameChange, 1000);

    const handleTypeChange = (value: string) => {
        setParamType({value, isInteracted: true});
        if (optionList) {
            onChange({id, name: paramName.value, type: value}, selectedOption);
        } else {
            onChange({id, name: paramName.value, type: value});
        }
    };
    const debouncedTypeChange = debounce(handleTypeChange, 1000);

    const handleOnSelect = (value: string) => {
        setSelectedOption(value);
    };

    return (
        <div className={classes.paramContainer}>
            <div className={classes.paramTypeWrapper}>
                <SelectDropdownWithButton
                    dataTestId="param-type-selector"
                    // defaultValue={}
                    placeholder={"Select Type"}
                    customProps={{ values: optionList, disableCreateNew: true }}
                    onChange={handleOnSelect}
                    label="Param Type"
                />
            </div>
            <div className={classes.paramItemWrapper}>
                <FormTextInput
                    label="Data Type"
                    dataTestId="data-type"
                    defaultValue={(paramType?.isInteracted || isEdit) ? paramType.value : ""}
                    onChange={debouncedTypeChange}
                    customProps={{
                        // isErrored: ((currentComponentSyntaxDiag !== undefined && currentComponentName === "Name") ||
                        //     model?.functionName?.viewState?.diagnosticsInRange[0]?.message)
                    }}
                    // errorMessage={(currentComponentSyntaxDiag && currentComponentName === "Name"
                    //         && currentComponentSyntaxDiag[0].message) ||
                    //     model?.functionName?.viewState?.diagnosticsInRange[0]?.message}
                    onBlur={null}
                    // onFocus={onNameFocus}
                    placeholder={"Data Type"}
                    size="small"
                    // disabled={addingNewParam || (currentComponentSyntaxDiag && currentComponentName !== "Name")}
                />
            </div>
            <div className={classes.paramItemWrapper}>
                <FormTextInput
                    label="Name"
                    dataTestId="param-name"
                    defaultValue={(paramName?.isInteracted || isEdit) ? paramName.value : ""}
                    onChange={debouncedNameChange}
                    customProps={{
                        // isErrored: ((currentComponentSyntaxDiag !== undefined && currentComponentName === "Name") ||
                        //     model?.functionName?.viewState?.diagnosticsInRange[0]?.message)
                    }}
                    // errorMessage={(currentComponentSyntaxDiag && currentComponentName === "Name"
                    //         && currentComponentSyntaxDiag[0].message) ||
                    //     model?.functionName?.viewState?.diagnosticsInRange[0]?.message}
                    onBlur={null}
                    // onFocus={onNameFocus}
                    placeholder={"name"}
                    size="small"
                    // disabled={addingNewParam || (currentComponentSyntaxDiag && currentComponentName !== "Name")}
                />
            </div>
        </div>
    );
}
