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

import { useStyles } from "../../../Portals/ConfigForm/forms/style"
import { FormElementProps } from "../../Types";
import { IconBtnWithText } from "../Button/IconBtnWithText";
import { PrimaryButton } from "../Button/PrimaryButton";
import ExpressionEditor, { ExpressionEditorProps } from "../ExpressionEditor";
import { getInitialValue, transformFormFieldTypeToString } from "../ExpressionEditor/utils";
import { ExpressionEditorLabel } from "../ExpressionEditorLabel";

import "./style.scss";
import { appendToArray } from "./utils";

export function ExpressionEditorArray(props: FormElementProps<ExpressionEditorProps>) {
    const { customProps, model, defaultValue } = props;
    const classes = useStyles();

    const [changed, setChanged] = useState(true);
    const [clearInput, setClearInput] = useState(false);
    const [addButtonDisabled, setAddButtonDisabled] = useState(false);
    const [subEditorValue, setSubEditorValue] = useState("");
    const [mainEditorValue, setMainEditorValue] = useState(getInitialValue(defaultValue, model));

    const handleSubEditorValidation = (_field: string, isInvalid: boolean) => {
        if (subEditorValue === "") {
            setAddButtonDisabled(true)
        } else {
            setAddButtonDisabled(isInvalid)
        }
    }

    const handleSubEditorChange = (value: string) => {
        setSubEditorValue(value)
    }

    const handleMainEditorChange = (value: string) => {
        setMainEditorValue(value)
    }

    const revertClearInput = () => {
        setClearInput(false);
    }

    const handleAddButtonClick = () => {
        const newArray = appendToArray(subEditorValue, mainEditorValue || "");
        model.value = newArray;
        setMainEditorValue(newArray)
        setClearInput(true)
        setChanged(!changed)
    }

    const mainEditorType: string = transformFormFieldTypeToString(model);
    const subEditorType: string = mainEditorType.substring(0, mainEditorType.length - 2);
    const elementPropsSubEditor: FormElementProps = {
        model: {
            name: "sub_editor_" + model.name,
            displayName: "Item",
            type: subEditorType,
            value: subEditorValue,
            tooltip: "Add elements to Array",
            optional: true,
            customAutoComplete: model.customAutoComplete
        },
        customProps: {
            validate: handleSubEditorValidation,
            clearInput,
            revertClearInput,
            subEditor: true
        },
        onChange: handleSubEditorChange
    };

    model.displayName = "Array Expression";

    return (
        <>
            <ExpressionEditorLabel {...props} model={{...model, displayName: model.name || model.displayName}} />
            <div className={classes.groupedForm}>
                <ExpressionEditor {...elementPropsSubEditor} />
                <div className="add-element-button">
                    <IconBtnWithText
                        disabled={addButtonDisabled}
                        text={"Add Item"}
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
