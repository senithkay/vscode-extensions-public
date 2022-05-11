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
import { useIntl } from "react-intl";

import { TooltipIcon } from "@wso2-enterprise/ballerina-low-code-edtior-ui-components";
import { STNode } from "@wso2-enterprise/syntax-tree";
import cn from "classnames";

import { StatementEditorContext } from "../../store/statement-editor-context";
import { getExpressionTypeComponent, isPositionsEquals } from "../../utils";
import { useStatementRendererStyles } from "../styles";


export interface ExpressionComponentProps {
    model: STNode;
    children?: React.ReactElement[];
    classNames?: string;
}

export function ExpressionComponent(props: ExpressionComponentProps) {
    const { model, children, classNames } = props;

    const component = getExpressionTypeComponent(model);

    const [isHovered, setHovered] = React.useState(false);

    const { modelCtx } = useContext(StatementEditorContext);
    const {
        currentModel: selectedModel,
        changeCurrentModel,
        hasSyntaxDiagnostics
    } = modelCtx;

    const intl = useIntl();
    const statementRendererClasses = useStatementRendererStyles();

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

    const styleClassNames = cn(statementRendererClasses.expressionElement,
        isSelected && !hasSyntaxDiagnostics && statementRendererClasses.expressionElementSelected,
        isSelected && hasSyntaxDiagnostics && statementRendererClasses.syntaxErrorElementSelected,
        {
            "hovered": !isSelected && isHovered && !hasSyntaxDiagnostics,
        },
        classNames
    )

    const syntaxErrorMessage = intl.formatMessage({
        id: "statement.editor.syntaxError.warning",
        defaultMessage: "Fix the error first"
    });

    return (
        <>
            <span
                onMouseOver={onMouseOver}
                onMouseOut={onMouseOut}
                className={styleClassNames}
                onClick={onMouseClick}
            >
                {component}
                {children}
            </span>
            <span style={{ position: 'absolute', top: '-10px' }}>
                {isSelected && hasSyntaxDiagnostics && (
                    <TooltipIcon title={syntaxErrorMessage} placement='top-end' arrow={true} />
                )}
            </span>
        </>
    );
}
