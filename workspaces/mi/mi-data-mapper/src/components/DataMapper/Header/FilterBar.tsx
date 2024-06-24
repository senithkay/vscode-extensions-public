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
import { Node, SyntaxKind } from 'ts-morph';
import FilterBarItem from './FilterBarItem';
import { useDMExpressionBarStore } from '../../../store/store';

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
    })
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


    const resetExprBarFocus = useDMExpressionBarStore(state => state.resetFocus);

    const filterElements = useMemo(() => {
        if (!(inputNode instanceof FocusedInputNode)) return [];

        const callExpressions = inputNode.value.getDescendantsOfKind(SyntaxKind.CallExpression);

        // Filter to get only those that are calling 'filter'
        const filterCalls = callExpressions.filter(call => {
            const expression = call.getExpression();
            return Node.isPropertyAccessExpression(expression) && expression.getName() === "filter";
        });        

        return filterCalls.reverse().map((filter, index) => <FilterBarItem index={index + 1} filterNode={filter} />);
    }, [inputNode]);

    const onClickAddFilter = () => {
        console.log("Adding new filter");
    }

    const onClickFilterBar = () => {
        resetExprBarFocus();
    }

    return (
        <div
            className={classes.exprBarContainer}
            onClick={onClickFilterBar}
        >
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
