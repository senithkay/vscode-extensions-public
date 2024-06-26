/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useMemo, useState } from 'react';

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
    const { inputNode, applyModifications } = props;
    const classes = useStyles();

    const [hasAddedNewFilter, setHasAddedNewFilter] = useState(false);

    const resetExprBarFocus = useDMExpressionBarStore(state => state.resetFocus);

    const [filterBarItems, inputNodeLabel] = useMemo(() => {
        if (!(inputNode instanceof FocusedInputNode)) return [];

        const callExpressions = inputNode.value.getDescendantsOfKind(SyntaxKind.CallExpression);

        // Filter to get only those that are calling 'filter'
        const filterCalls = callExpressions.filter(call => {
            const expression = call.getExpression();
            return Node.isPropertyAccessExpression(expression) && expression.getName() === "filter";
        });        

        const filterBarItems = filterCalls
            .reverse()
            .map((filter, index) => (
                <FilterBarItem
                    key={`filterBarItem${index}`}
                    index={index + 1}
                    filterNode={filter}
                    justAdded={index === filterCalls.length - 1 && hasAddedNewFilter}
                    applyModifications={applyModifications}
                />
            ));

        setHasAddedNewFilter(false);

        return [filterBarItems, inputNode.nodeLabel];
    }, [inputNode]);

    const onClickAddFilter = async () => {
        const newFilter = `\n.filter(${inputNodeLabel} => ${inputNodeLabel} !== null)`;

        const callExpr = (inputNode as FocusedInputNode).value;
        const callExprExpr = callExpr.getExpression();

        let targetExpr: Node;
        if (Node.isPropertyAccessExpression(callExprExpr)) {
            targetExpr = callExprExpr.getExpression();
        }

        const updatedExpression = targetExpr.getText() + newFilter;
        targetExpr.replaceWithText(updatedExpression);
        await applyModifications();

        setHasAddedNewFilter(true);
    }

    const onClickFilterBar = () => {
        resetExprBarFocus();
    }

    return (
        <div
            className={classes.exprBarContainer}
            onClick={onClickFilterBar}
        >
            {filterBarItems}
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
