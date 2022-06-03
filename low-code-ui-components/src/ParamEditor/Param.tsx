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

import React from 'react';

import { SelectDropdownWithButton } from "../DropDown/SelectDropdownWithButton";
import { FormTextInput } from "../FormTextInput";

import { useStyles } from "./style";


export interface SwitchToggleProps {
    onSave: () => void,
    onCancel: string;
}

export function Param(props: SwitchToggleProps) {

    const classes = useStyles();

    const handleOnSelect = () => {
    // s
    };

    return (
        <div className={classes.paramRoot}>
            <div className={classes.paramTypeWrapper}>
                <SelectDropdownWithButton
                    dataTestId="param-type-selector"
                    // defaultValue={}
                    customProps={{ values: ["A", "B", "C"], disableCreateNew: true }}
                    onChange={handleOnSelect}
                    label="HTTP Method"
                />
            </div>
            <div className={classes.paramItemWrapper}>
                <FormTextInput
                    label="Name"
                    dataTestId="function-name"
                    // defaultValue={(functionName?.isInteracted || isEdit) ? functionName.value : ""}
                    // onChange={debouncedNameChange}
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
            <div className={classes.paramItemWrapper}>
                <FormTextInput
                    label="Name"
                    dataTestId="function-name"
                    // defaultValue={(functionName?.isInteracted || isEdit) ? functionName.value : ""}
                    // onChange={debouncedNameChange}
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
