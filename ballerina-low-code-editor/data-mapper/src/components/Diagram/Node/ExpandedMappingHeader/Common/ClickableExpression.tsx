import React from "react";
import { STNode } from "@wso2-enterprise/syntax-tree";
import clsx from "clsx";
import { useStyles } from "../styles";
import { ErrorIcon } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { DiagnosticTooltip } from "../../../Diagnostic/DiagnosticTooltip/DiagnosticTooltip";

export const ClickableExpression = (props: { node: STNode, onEditClick: () => void; index?: number; testIdPrefix?: string, expressionPlaceholder?:string }) => {
    const classes = useStyles();
    const { node, onEditClick, index, testIdPrefix, expressionPlaceholder = '<add-expression>' } = props;
    const hasDiagnostic = !!node?.typeData?.diagnostics?.length && node.source.trim() !== 'EXPRESSION';

    if(hasDiagnostic){
        return <DiagnosticTooltip
        placement="right"
        diagnostic={node?.typeData?.diagnostics?.[0]}
        value={node.source}
        onClick={onEditClick}
    >
        <span className={clsx(classes.clauseDiagnostics, classes.clauseExpression)} data-testid={`${testIdPrefix || 'intermediate-clause-expression'}-${index}`}>
            {node.source}
            <span className={classes.errorIconWrapper}>
                <ErrorIcon />
            </span>
        </span>
    </DiagnosticTooltip>
    }
    
    return <span
        className={clsx(
            {
                [classes.clausePlaceholder]: node.source.trim() === 'EXPRESSION',
                [classes.clauseExpression]: true
            },

        )}
        onClick={onEditClick}
        data-testid={`intermediate-clause-expression-${index}`}
    >
        {node.source.trim() === 'EXPRESSION' ? expressionPlaceholder : node.source}
    </span>
}