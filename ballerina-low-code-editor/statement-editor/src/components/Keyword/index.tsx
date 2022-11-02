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
import React, { useContext } from "react";

import {
    AscendingKeyword, DescendingKeyword, FinalKeyword
} from "@wso2-enterprise/syntax-tree";
import cn from "classnames";

import { StatementEditorContext } from "../../store/statement-editor-context";
import { getJSXForMinutiae, isPositionsEquals } from "../../utils";
import { StatementEditorViewState } from "../../utils/statement-editor-viewstate";
import { InputEditor } from "../InputEditor";
import { useStatementRendererStyles } from "../styles";

export interface KeywordComponentProps {
    model: AscendingKeyword |
        DescendingKeyword |
        FinalKeyword;
}

export function KeywordComponent(props: KeywordComponentProps) {
    const { model } = props;

    const [isHovered, setHovered] = React.useState(false);

    const { modelCtx } = useContext(StatementEditorContext);
    const {
        currentModel: selectedModel,
        changeCurrentModel,
        hasSyntaxDiagnostics
    } = modelCtx;

    const statementRenedererClasses = useStatementRendererStyles();

    const isSelected = selectedModel.model && model && isPositionsEquals(selectedModel.model.position, model.position);

    const onMouseOver = (e: React.MouseEvent) => {
        setHovered(true);
        e.stopPropagation();
        e.preventDefault();
    }

    const onMouseOut = (e: React.MouseEvent) => {
        setHovered(false);
        e.stopPropagation();
        e.preventDefault();
    }

    const onMouseClick = (e: React.MouseEvent) => {
        if (!hasSyntaxDiagnostics) {
            e.stopPropagation();
            e.preventDefault();
            changeCurrentModel(model);
        }
    }

    const styleClassNames = cn(statementRenedererClasses.expressionElement,
        isSelected && statementRenedererClasses.expressionElementSelected,
        {
            "hovered": !isSelected && isHovered && !hasSyntaxDiagnostics,
        },
    )
    const inputEditorProps = {
        model,
        classNames: "keyword",
        notEditable: true
    };

    const multiLineConstructorConfig = (model.viewState as StatementEditorViewState).multilineConstructConfig;
    const isFieldWithNewLine = multiLineConstructorConfig.isFieldWithNewLine;

    const leadingMinutiaeJSX = getJSXForMinutiae(model.leadingMinutiae, isFieldWithNewLine);
    const trailingMinutiaeJSX = getJSXForMinutiae(model.trailingMinutiae, isFieldWithNewLine);

    return (
        <span
            onMouseOver={onMouseOver}
            onMouseOut={onMouseOut}
            className={styleClassNames}
            onClick={onMouseClick}
        >
            {leadingMinutiaeJSX}
            <InputEditor {...inputEditorProps} />
            {trailingMinutiaeJSX}
        </span>
    );
}
