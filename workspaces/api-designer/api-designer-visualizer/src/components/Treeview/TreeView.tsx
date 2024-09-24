/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { ReactNode, useState } from 'react';
import styled from "@emotion/styled";
import { Button, Codicon, Icon } from '@wso2-enterprise/ui-toolkit';

export interface TreeItem {
    id: string;
    content: string | ReactNode;
    body?: string | ReactNode;
    children?: TreeItem[];
}

export interface TreeViewProps {
    items: TreeItem[];
    sx?: any;
    isChild?: boolean;
}

const TreeContainer = styled.div`
    ${(props: TreeViewProps) => props.sx};
`;

const BodyContainer = styled.div`
    margin-left: 24px;
`;

const IconContent = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 5px;
`;

interface TreeItemContainerProps {
    isChild?: boolean;
};

const TreeItemContainer = styled.div<TreeItemContainerProps>`
    margin-left: ${({ isChild }: TreeItemContainerProps) => isChild ? '20px' : '0'};
    cursor: pointer;
`;

const TreeLabel = styled.span`
    font-weight: bold;
`;
const ChildrenContainer = styled.div<{ isExpanded: boolean }>`
    max-height: ${({ isExpanded }: { isExpanded: boolean }) => isExpanded ? '1000px' : '0'};
    overflow: hidden;
    transition: max-height 0.3s ease;
`;

export function TreeView(props: TreeViewProps) {
    const { items, isChild } = props;
    const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

    const toggleItem = (id: string) => {
        setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <TreeContainer>
            {items.map((item) => (
                <TreeItemContainer key={item.id} isChild={isChild}>
                    <TreeLabel onClick={() => toggleItem(item.id)}>
                        <IconContent>
                            <Button appearance='icon'>
                                <Codicon name={expandedItems[item.id] ? 'chevron-down' : 'chevron-right'} />
                            </Button>
                            <>{item.content}</>
                        </IconContent>
                        {item.body && expandedItems[item.id] && <BodyContainer>{item.body}</BodyContainer>}
                    </TreeLabel>
                    {item.children && (
                        <ChildrenContainer isExpanded={!!expandedItems[item.id]}>
                            <TreeView items={item.children} isChild/>
                        </ChildrenContainer>
                    )}
                </TreeItemContainer>
            ))}
        </TreeContainer>
    );
};
