/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import React, { useContext } from "react";

import { ExpressionEditor } from "@wso2-enterprise/ballerina-expression-editor";
import { CustomLowCodeContext } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { Context } from "../../../../../Contexts/Diagram";
import { useStyles } from "../../DynamicConnectorForm/style";
import { FormElementProps } from "../../Types";
import { ExpressionConfigurable } from "../ExpressionConfigurable";

interface XMLProps {
    validate?: (field: string, isInvalid: boolean) => void;
}

export function XML(props: FormElementProps<XMLProps>) {
    const { model, customProps, onChange, defaultValue } = props;
    const classes = useStyles();
    if (model?.name === undefined) {
        model.name = "xml"
    }

    const validateExpression = (fieldName: string, isInvalid: boolean) => {
        customProps?.validate(fieldName, isInvalid)
    }

    const onPropertyChange = (value: string) => {
        model.value = value
        if (onChange) {
            onChange(value);
        }
    }

    const {
        state: { targetPosition: targetPositionDraft },
        props: {
            currentFile,
            langServerURL,
            syntaxTree,
            diagnostics: mainDiagnostics,
        },
        api: {
            ls: { getExpressionEditorLangClient },
        }
    } = useContext(Context);

    const lowCodeEditorContext: CustomLowCodeContext = {
        targetPosition: targetPositionDraft,
        currentFile,
        langServerURL,
        syntaxTree,
        diagnostics: mainDiagnostics,
        ls: { getExpressionEditorLangClient }
    }

    return (
        <div className={classes.arraySubWrapper}>
            <ExpressionEditor
                model={model}
                customProps={{
                    validate: validateExpression,
                    statementType: model.typeName
                }}
                defaultValue={model.value}
                onChange={onPropertyChange}
                expressionConfigurable={ExpressionConfigurable}
                lowCodeEditorContext={lowCodeEditorContext}
            />
        </div>
    );
}
