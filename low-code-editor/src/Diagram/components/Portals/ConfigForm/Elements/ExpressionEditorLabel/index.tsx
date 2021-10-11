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
import React from "react";
import { FormattedMessage } from "react-intl";

import { FormHelperText } from "@material-ui/core";
import * as MonacoEditor from 'monaco-editor';

import { TooltipCodeSnippet, TooltipIcon } from "../../../../../../components/Tooltip";
import { useStyles as useFormStyles } from "../../forms/style";
import { FormElementProps } from "../../types";
import { ExpressionEditorProps } from "../ExpressionEditor";
import { transformFormFieldTypeToString } from "../ExpressionEditor/utils";
import { useStyles as useTextInputStyles } from "../TextField/style";

import { getExampleForType, truncateText, variableNameMaxLength } from "./utils";

export function ExpressionEditorLabel(props: FormElementProps<ExpressionEditorProps>) {
    const { model, customProps } = props;

    const formClasses = useFormStyles();
    const textFieldClasses = useTextInputStyles();

    const textLabel = model.label || model.displayName || model.name;
    const typeString = transformFormFieldTypeToString(model, true);

    const codeRef = (ref: HTMLPreElement) => {
        if (ref) {
            MonacoEditor.editor.colorizeElement(ref, { theme: 'choreoLightTheme' });
        }
    }
    const EditorType = () => (
        <code
            ref={codeRef}
            data-lang="ballerina"
            className={textFieldClasses.code}
        >
            {truncateText(typeString)}
        </code>
    );

    return (
        <>
            {typeString && (
                <TooltipCodeSnippet disabled={typeString?.length <= variableNameMaxLength} content={typeString} placement="right" arrow={true}>
                    <div className={textFieldClasses.codeWrapper}>
                            <EditorType />
                    </div>
                </TooltipCodeSnippet>
            )}
        </>
    )
}
