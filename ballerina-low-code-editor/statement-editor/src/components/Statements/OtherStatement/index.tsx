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
// tslint:disable: jsx-no-multiline-js
import React, { useContext } from "react";

import cn from "classnames";


import SyntaxErrorWarning from "../../../assets/icons/SyntaxErrorWarning";
import { OtherStatementNodeTypes } from "../../../constants";
import { StatementEditorContext } from "../../../store/statement-editor-context";
import { getJSXForMinutiae } from "../../../utils";
import { StatementEditorViewState } from "../../../utils/statement-editor-viewstate";
import { InputEditor } from "../../InputEditor";
import { useStatementRendererStyles } from "../../styles";

interface OtherStatementProps {
    model: OtherStatementNodeTypes;
}

export function OtherStatementTypes(props: OtherStatementProps) {
    const { model } = props;

    const statementRendererClasses = useStatementRendererStyles();

    const inputEditorProps = {
        model
    };

    const { modelCtx } = useContext(StatementEditorContext);
    const {
        hasSyntaxDiagnostics
    } = modelCtx;


    const isFieldWithNewLine = (model?.viewState as StatementEditorViewState)?.multilineConstructConfig?.isFieldWithNewLine;

    const leadingMinutiaeJSX = getJSXForMinutiae(model?.leadingMinutiae, isFieldWithNewLine);
    const trailingMinutiaeJSX = getJSXForMinutiae(model?.trailingMinutiae, isFieldWithNewLine);


    const styleClassNames = cn(statementRendererClasses.expressionElement,
        !hasSyntaxDiagnostics && statementRendererClasses.expressionElementSelected,
        hasSyntaxDiagnostics && statementRendererClasses.syntaxErrorElementSelected
    )


    return (
        <span className={styleClassNames}>
            {hasSyntaxDiagnostics  && (
                <span className={statementRendererClasses.syntaxErrorTooltip} data-testid="syntax-error-highlighting">
                    <SyntaxErrorWarning />
                </span>
            )}
            {leadingMinutiaeJSX}
            <InputEditor {...inputEditorProps} />
            {trailingMinutiaeJSX}
        </span>
    );
}
