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
import {
    ExpressionEditorLabel,
    ExpressionEditorProps,
    getInitialValue,
    transformFormFieldTypeToString
} from "@wso2-enterprise/ballerina-expression-editor";
import {
    FormElementProps,
    IconBtnWithText
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { useStyles } from "../../DynamicConnectorForm/style"
import { LowCodeExpressionEditor } from "../LowCodeExpressionEditor";

import "./style.scss";
import { appendToMap } from "./utils";

export function ExpressionEditorMap(props: FormElementProps<ExpressionEditorProps>) {
    const { customProps, model, defaultValue } = props;
    const classes = useStyles();

    model.label = "Map Expression"
    const [changed, setChanged] = useState(true);
    const [mainEditorValue, setMainEditorValue] = useState(getInitialValue(defaultValue, model));
    const [clearInput, setClearInput] = useState(false);

    const handleMainEditorChange = (value: string) => {
        setMainEditorValue(value)
    }

    const handleAddButtonClick = () => {
        const updatedMap = appendToMap(keyEditorContent, valueEditorContent, mainEditorValue || "");
        model.value = updatedMap;
        setMainEditorValue(updatedMap)
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
        if (keyEditorContent === "") {
            setKeyEditorValid(true)
        } else {
            setKeyEditorValid(isInvalid)
        }
    }

    const handleKeyEditorChange = (value: string) => {
        setKeyEditorContent(value)
    }

    const elementPropsKeyEditor: FormElementProps = {
        model: {
            name: "key_editor_" + model.name,
            label: `${model.name} Key`,
            type: keyEditorType,
            value: keyEditorContent,
            tooltip: "Key of the Key-Value pair",
            optional: true,
            //ToDo: Commented out this as it seems to be not used inside Expression editor
            //customAutoComplete: model?.customAutoComplete
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
    // const valueEditorType: string = transformFormFieldTypeToString(model.fields[0]);
    const valueEditorType: string = model?.paramType?.typeName;

    const handleValueEditorValidation = (_field: string, isInvalid: boolean) => {
        if (valueEditorContent === "") {
            setValueEditorValid(true)
        } else {
            setValueEditorValid(isInvalid)
        }
    }

    const handleValueEditorChange = (value: string) => {
        setValueEditorContent(value)
    }

    const elementPropsValueEditor: FormElementProps = {
        model: {
            name: "value_editor_" + model.name,
            label: `${model.name} Value`,
            type: valueEditorType,
            value: valueEditorContent,
            tooltip: "Value of the Key-Value pair",
            optional: true,
            //ToDo: Commented out this as it seems to be not used inside Expression editor
            // customAutoComplete: model?.fields[0]?.customAutoComplete
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
            <ExpressionEditorLabel {...props} model={{...model, label: model.name}} />
            <div className={classes.groupedForm}>
                <LowCodeExpressionEditor {...elementPropsKeyEditor} />
                <LowCodeExpressionEditor {...elementPropsValueEditor} />
                <div className="add-element-button">
                    <IconBtnWithText
                        disabled={keyEditorValid || valueEditorValid}
                        text={"Add Key-Value Pair"}
                        onClick={handleAddButtonClick}
                        icon={<AddRounded fontSize="small" className={classes.iconButton} />}
                    />
                </div>
                <LowCodeExpressionEditor
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
