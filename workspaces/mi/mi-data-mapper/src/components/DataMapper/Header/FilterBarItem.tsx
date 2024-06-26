/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useEffect, useState } from 'react';

import { css } from '@emotion/css';
import { CallExpression } from 'ts-morph';
import classNames from 'classnames';

import { useDMExpressionBarStore } from '../../../store/store';
import { getPosition, isPositionsEquals } from '../../../components/Diagram/utils/st-utils';
import { getDiagnostics } from '../../../components/Diagram/utils/diagnostics-utils';
import { getFilterExpression } from './utils';
import { Tooltip } from '@wso2-enterprise/ui-toolkit';

const useStyles = () => ({
    filterItem: css({
        color: "var(--vscode-foreground)",
        padding: "4px 16px",
        margin: "2px 2px",
        borderRadius: "1rem",
        border: "1px solid var(--vscode-menu-separatorBackground)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        cursor: "pointer",
        transition: "background-color 0.3s",
        '&:hover': {
            backgroundColor: "var(--vscode-button-secondaryHoverBackground)"
        }
    }),
    filterItemFocused: css({
        outline: "1px solid var(--vscode-inlineChatInput-focusBorder)",
    }),
    filterItemError: css({
        outline: "1px solid var(--vscode-editorError-foreground)"
    })
});

const diagnosticsTooltipStyles = {
    fontFamily: "monospace",
    fontSize: "12px"
};

export interface FilterBarItemProps {
    index: number;
    filterNode: CallExpression;
    justAdded: boolean;
};

export default function FilterBarItem(props: FilterBarItemProps) {
    const { index, filterNode, justAdded } = props;
    const classes = useStyles();

    const [isFocused, setIsFocused] = useState(justAdded);

    const { focusedPort, focusedFilter, setExprBarFocusedFilter, resetExprBarFocus } = useDMExpressionBarStore(state => ({
        focusedPort: state.focusedPort,
        focusedFilter: state.focusedFilter,
        setExprBarFocusedFilter: state.setFocusedFilter,
        resetExprBarFocus: state.resetFocus
    }));

    const filterExpr = filterNode && !filterNode.wasForgotten() && getFilterExpression(filterNode);
    const diagnostics = filterExpr && getDiagnostics(filterExpr);
    const isEmptyExpr = filterExpr && filterExpr.getText() === "";
    const hasDiagnostics = diagnostics && diagnostics.length > 0;
    const diagnosticMsg = hasDiagnostics
        ? diagnostics[0].getMessageText()
        : isEmptyExpr ? "Expression expected." : "";

    useEffect(() => {
        const focused = focusedFilter
            && filterExpr
            && !focusedFilter.wasForgotten()
            && isPositionsEquals(getPosition(filterExpr), getPosition(focusedFilter));
        setIsFocused(focused);
    }, [focusedFilter])

    useEffect(() => {
        if (justAdded && filterExpr) {
            setExprBarFocusedFilter(filterExpr);
        }
    }, [justAdded])

    const onClick = (event: React.MouseEvent<HTMLDivElement>) => {
        event.stopPropagation();
        if (focusedPort) {
            resetExprBarFocus();
        }
        setExprBarFocusedFilter(filterExpr);
    };

    const trimText = (text: string, maxLength: number = 50) => {
        if (text.length > maxLength) {
            return text.substring(0, maxLength) + '...';
        }
        return text;
    };
    
    return (
        <>
            {filterExpr ? (
                <Tooltip
                    content={diagnosticMsg}
                    position='bottom'
                    sx={diagnosticsTooltipStyles}
                >
                    <div
                        key={index}
                        className={classNames(
                            classes.filterItem,
                            isFocused ? classes.filterItemFocused : "",
                            (hasDiagnostics || isEmptyExpr) && !isFocused ? classes.filterItemError : ""
                        )}
                        onClick={onClick}
                    >
                        {`Filter ${index}`}: {trimText(filterExpr.getText())}
                    </div>
                </Tooltip>
            ) : <></>}
        </>
    );
}
