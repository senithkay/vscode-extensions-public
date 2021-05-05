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
import React, { useState } from "react";

import { FormElementProps } from "../../types";
import { PrimaryButton } from "../Button/PrimaryButton";
import ExpressionEditor from "../ExpressionEditor";
import { ExpressionEditorLabel } from "../ExpressionEditorLabel";

import { appendToArray } from "./utils";

interface ExpressionEditorArrayProps {
    elementProps: FormElementProps;
}

export function ExpressionEditorArray(props: ExpressionEditorArrayProps) {
    const { elementProps } = props;

    const [changed, setChanged] = useState(true);
    const [tinyClearInput, setTinyClearInput] = useState(false);
    const [tinyValue, setTinyValue] = useState("");
    const [mainValue, setMainValue] = useState(elementProps.model?.value);
    const [tinyDisabled, setTinyDisabled] = useState(false);

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

    const expEditorProps: FormElementProps = {
        model: {...elementProps.model, value: mainValue},
        customProps: {
            ...elementProps.customProps,
            hideTextLabel: true,
            changed
        },
        onChange: handleMainValueChange
    }

    const elementPropsTiny: FormElementProps = {
        model: {
            name: "tiny_" + elementProps.model.name,
            type: elementProps.model.collectionDataType,
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
        elementProps.model.value = appendToArray(tinyValue, mainValue);
        setMainValue(appendToArray(tinyValue, mainValue))
        setTinyClearInput(true)
        setChanged(!changed)
    }


    return (
        <>
            <ExpressionEditorLabel {...elementProps} />
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
                {...expEditorProps}
            />
        </>
    )
}
