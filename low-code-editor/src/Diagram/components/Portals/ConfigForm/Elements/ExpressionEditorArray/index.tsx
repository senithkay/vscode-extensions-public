/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
// tslint:disable: jsx-no-multiline-js no-empty jsx-curly-spacing
import React, { useState } from "react";

import { FormElementProps } from "../../types";
import { PrimaryButton } from "../Button/PrimaryButton";
import ExpressionEditor, { ExpressionEditorProps } from "../ExpressionEditor";
import { getInitialValue, transformFormFieldTypeToString } from "../ExpressionEditor/utils";
import { ExpressionEditorLabel } from "../ExpressionEditorLabel";

import { appendToArray } from "./utils";

export function ExpressionEditorArray(props: FormElementProps<ExpressionEditorProps>) {
    const { customProps, model, defaultValue } = props;

    const [changed, setChanged] = useState(true);
    const [tinyClearInput, setTinyClearInput] = useState(false);
    const [tinyDisabled, setTinyDisabled] = useState(false);
    const [tinyValue, setTinyValue] = useState("");
    const [mainValue, setMainValue] = useState(getInitialValue(defaultValue, model));

    const tinyType: string = transformFormFieldTypeToString(model).replace("[]", "");

    const handleTinyValidation = (_field: string, isInvalid: boolean) => {
        setTinyDisabled(isInvalid)
    }

    const handleTinyChange = (value: string) => {
        setTinyValue(value)
    }

    const handleMainValueChange = (value: string) => {
        setMainValue(value)
    }

    const revertClearInput = () => {
        setTinyClearInput(false);
    }

    const elementPropsTiny: FormElementProps = {
        model: {
            name: "tiny_" + model.name,
            type: tinyType,
            value: tinyValue
        },
        customProps: {
            validate: handleTinyValidation,
            hideTextLabel: true,
            clearInput: tinyClearInput,
            revertClearInput
        },
        onChange: handleTinyChange
    };

    const handleOnClick = () => {
        const newArray = appendToArray(tinyValue, mainValue || "");
        model.value = newArray;
        setMainValue(newArray)
        setTinyClearInput(true)
        setChanged(!changed)
    }


    return (
        <>
            <ExpressionEditorLabel {...props} />
            <span style={{marginBottom: 10, display: 'flex'}}>
                <div style={{width: 208, paddingRight: 8}}>
                    <ExpressionEditor {...elementPropsTiny} />
                </div>
                <PrimaryButton
                    text={"Add"}
                    fullWidth={false}
                    onClick={handleOnClick}
                    disabled={tinyDisabled}
                />
            </span>
            <ExpressionEditor
                model={model}
                customProps={{
                    ...customProps,
                    hideTextLabel: true,
                    changed
                }}
                onChange={handleMainValueChange}
            />
        </>
    )
}
