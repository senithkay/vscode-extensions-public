/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useMemo } from 'react';

import { css } from '@emotion/css';
import { Codicon, LinkButton } from '@wso2-enterprise/ui-toolkit';

import { FocusedInputNode } from '../../../components/Diagram/Node';
import { DataMapperNodeModel } from 'src/components/Diagram/Node/commons/DataMapperNode';
import { ArrowFunction, Node, SyntaxKind } from 'ts-morph';

const useStyles = () => ({
    exprBarContainer: css({
        display: "flex",
        flexWrap: "wrap",
        width: "100%",
        height: "auto",
        backgroundColor: "var(--vscode-sideBarTitle-background)",
        alignItems: "flex-start", 
        padding: '5px'
    }),
    addFilterButton: css({
        lineHeight: 2
    }),
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
});

const linkButtonStyles = {
    fontSize: "12px",
    gap: "0px",
    padding: "3px 12px",
    height: "auto",
    borderRadius: "1rem"
};

export interface FilterBarProps {
    inputNode: DataMapperNodeModel;
    applyModifications: () => Promise<void>;
}

export default function FilterBar(props: FilterBarProps) {
    const { inputNode } = props;
    const classes = useStyles();

    const filterElements = useMemo(() => {
        if (!(inputNode instanceof FocusedInputNode)) return [];

        const callExpressions = inputNode.value.getDescendantsOfKind(SyntaxKind.CallExpression);

        // Filter to get only those that are calling 'filter'
        const filterCalls = callExpressions.filter(call => {
            const expression = call.getExpression();
            return Node.isPropertyAccessExpression(expression) && expression.getName() === "filter";
        });
        
        // Extract the arrow functions body from these filter calls
        const filterExprs = filterCalls
            .map(call => call.getArguments()[0])
            .filter(arg => Node.isArrowFunction(arg))
            .map(arrowFn => (arrowFn as ArrowFunction).getBody());
        

        return filterExprs.reverse().map((filter, index) => {
            let filterText = filter.getText();
            
            if (Node.isBlock(filter)) {
                const returnStmt = filter.getStatementByKind(SyntaxKind.ReturnStatement);
                filterText = returnStmt ? returnStmt.getExpression().getText() : filterText;
            }

            return (
                <div
                    key={index}
                    className={classes.filterItem}
                >
                    {`Filter ${index + 1}`}: {filterText}
                </div>
            );
        });
    }, [inputNode]);

    const onClickAddFilter = () => {
        console.log("Adding new filter");
    }

    return (
        <div className={classes.exprBarContainer}>
            {filterElements}
            <LinkButton
                sx={linkButtonStyles}
                onClick={onClickAddFilter}
                className={classes.addFilterButton}
            >
                <Codicon name="add" iconSx={{ fontSize: "12px" }} />
                <>Add Filter</>
            </LinkButton>
        </div>
    );
}
