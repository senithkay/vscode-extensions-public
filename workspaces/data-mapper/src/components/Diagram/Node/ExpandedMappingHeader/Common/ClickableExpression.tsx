/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import React from "react";

import { ErrorIcon } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { STNode } from "@wso2-enterprise/syntax-tree";
import clsx from "clsx";

import { DiagnosticTooltip } from "../../../Diagnostic/DiagnosticTooltip/DiagnosticTooltip";
import { useStyles } from "../styles";

export const ClickableExpression = (props: {
    node: STNode;
    onEditClick: () => void;
    index?: number;
    testIdPrefix?: string;
    expressionPlaceholder?: string;
}) => {
    const classes = useStyles();
    const { node, onEditClick, index, testIdPrefix, expressionPlaceholder = "<add-expression>" } = props;
    const hasDiagnostic = !!node?.typeData?.diagnostics?.length && node.source.trim() !== "EXPRESSION";

    if (hasDiagnostic) {
        return (
            <DiagnosticTooltip
                placement="right"
                diagnostic={node?.typeData?.diagnostics?.[0]}
                value={node.source}
                onClick={onEditClick}
            >
                <span
                    className={clsx(classes.clauseDiagnostics, classes.clauseExpression)}
                    data-testid={`${testIdPrefix || "intermediate-clause-expression"}-${index}`}
                >
                    {node.source}
                    <span className={classes.errorIconWrapper}>
                        <ErrorIcon />
                    </span>
                </span>
            </DiagnosticTooltip>
        );
    }

    return (
        <span
            className={clsx({
                [classes.clausePlaceholder]: node.source.trim() === "EXPRESSION",
                [classes.clauseExpression]: true,
            })}
            onClick={onEditClick}
            data-testid={`${testIdPrefix || "intermediate-clause-expression"}-${index}`}
        >
            {node.source.trim() === "EXPRESSION" ? expressionPlaceholder : node.source}
        </span>
    );
};
