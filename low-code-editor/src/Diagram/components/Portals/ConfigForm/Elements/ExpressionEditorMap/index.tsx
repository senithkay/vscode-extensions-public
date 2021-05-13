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

import { AddRounded } from "@material-ui/icons";

import { useStyles } from "../../forms/style"
import { FormElementProps } from "../../types";
import { IconBtnWithText } from "../Button/IconBtnWithText";
import ExpressionEditor, { ExpressionEditorProps } from "../ExpressionEditor";
import { getInitialValue, transformFormFieldTypeToString } from "../ExpressionEditor/utils";
import { ExpressionEditorLabel } from "../ExpressionEditorLabel";

import "./style.scss";
import { appendToMap } from "./utils";

export function ExpressionEditorMap(props: FormElementProps<ExpressionEditorProps>) {
    const { customProps, model, defaultValue } = props;
    const classes = useStyles();

    model.displayName = "Map Expression"
    const [changed, setChanged] = useState(true);
    const [mainEditorValue, setMainEditorValue] = useState(getInitialValue(defaultValue, model));
    const [clearInput, setClearInput] = useState(false);

    const handleMainEditorChange = (value: string) => {
        setMainEditorValue(value)
    }

    const handleAddButtonClick = () => {
        const newMap = appendToMap(keyEditorContent, valueEditorContent, mainEditorValue || "");
        model.value = newMap;
        setMainEditorValue(newMap)
        setClearInput(true)
        setChanged(!changed)
    }

    const revertClearInput = () => {
        setClearInput(false);
    }


    // States and functions for key-exp-editor
    const [keyEditorValid, setKeyEditorValid] = useState(false);
    const [keyEditorContent, setKeyEditorContent] = useState("");
    const keyEditorType: string = "string";

    const handleKeyEditorValidation = (_field: string, isInvalid: boolean) => {
        keyEditorContent === "" ? setKeyEditorValid(true) : setKeyEditorValid(isInvalid)
    }

    const handleKeyEditorChange = (value: string) => {
        setKeyEditorContent(value)
    }

    const elementPropsKeyEditor: FormElementProps = {
        model: {
            name: "key_editor_" + model.name,
            displayName: "Key",
            type: keyEditorType,
            value: keyEditorContent,
            tooltip: "Key of the Key-Value pair",
            optional: true
        },
        customProps: {
            validate: handleKeyEditorValidation,
            clearInput,
            revertClearInput,
            subEditor: true
        },
        onChange: handleKeyEditorChange
    };


    // States and functions for value-exp-editor
    const [valueEditorValid, setValueEditorValid] = useState(false);
    const [valueEditorContent, setValueEditorContent] = useState("");
    const valueEditorType: string = transformFormFieldTypeToString(model.fields);

    const handleValueEditorValidation = (_field: string, isInvalid: boolean) => {
        valueEditorContent === "" ? setValueEditorValid(true) : setValueEditorValid(isInvalid)
    }

    const handleValueEditorChange = (value: string) => {
        setValueEditorContent(value)
    }

    const elementPropsValueEditor: FormElementProps = {
        model: {
            name: "value_editor_" + model.name,
            displayName: "Value",
            type: valueEditorType,
            value: valueEditorContent,
            tooltip: "Value of the Key-Value pair",
            optional: true
        },
        customProps: {
            validate: handleValueEditorValidation,
            clearInput,
            revertClearInput,
            subEditor: true
        },
        onChange: handleValueEditorChange
    };

    return (
        <>
            <ExpressionEditorLabel {...props} model={{...model, displayName: model.name}} />
            <div className={classes.groupedForm}>
                <ExpressionEditor {...elementPropsKeyEditor} />
                <ExpressionEditor {...elementPropsValueEditor} />
                <div className="add-element-button">
                    <IconBtnWithText
                        disabled={keyEditorValid && valueEditorValid}
                        text={"Add Key-Value Pair"}
                        onClick={handleAddButtonClick}
                        icon={<AddRounded fontSize="small" className={classes.iconButton} />}
                    />
                </div>
                <ExpressionEditor
                    model={model}
                    customProps={{
                        ...customProps,
                        changed,
                        expandDefault: true
                    }}
                    onChange={handleMainEditorChange}
                />
            </div>
        </>
    )
}
