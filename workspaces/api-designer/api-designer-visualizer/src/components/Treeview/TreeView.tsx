/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { ReactNode, useEffect, useState } from 'react';
import styled from "@emotion/styled";
import { Codicon } from '@wso2-enterprise/ui-toolkit';

export interface TreeViewProps {
    id: string;
    content?: string | ReactNode;
    children?: ReactNode;
    rootTreeView?: boolean;
    selectedId?: string;
    onSelect?: (id: string) => void;
}

interface TreeContainerProps {
    isRootTreeView: boolean;
}
const TreeContainer = styled.div<TreeContainerProps>`
    padding-left: ${(props: TreeContainerProps) => props.isRootTreeView ? 0 : "20px"};
`;

interface IconContainerProps {
    isCollapsed: boolean;
    isSelected?: boolean;
}
const IconContainer = styled.div<IconContainerProps>`
    display: flex;
    flex-direction: row;
    gap: 5px;
    align-items: center;
    padding-top: 3px;
    padding-bottom: 3px;
    background-color: ${(props: IconContainerProps) => props.isSelected ? "var(--vscode-editorHoverWidget-background)" : "transparent"};
    &:hover {
        background-color: var(--vscode-editorHoverWidget-background);
    }
`;

export const TreeView: React.FC<TreeViewProps> = (props: TreeViewProps) => {
    const { id, content, children, rootTreeView: isRootTreeView, onSelect, selectedId } = props
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = (sId: string) => {
        if (onSelect) {
            onSelect(sId);
        }
        setIsExpanded(!isExpanded);
    };

    const handleSelect = (sId: string) => {
        if (onSelect) {
            onSelect(sId);
        }
    };

    useEffect(() => {
        // Expand if this TreeView is selected or contains the selected item
        if (
            selectedId === id || (children && React.Children.toArray(children).some((child: any) =>
                 child.props.id === selectedId))
        ) {
            setIsExpanded(true);
        }
    }, [selectedId, id, children]);

    return (
        <TreeContainer isRootTreeView={isRootTreeView}>
            <div onClick={() => toggleExpand(id)}>
                <IconContainer isCollapsed={!isExpanded} isSelected={selectedId === id}>
                    <Codicon name={isExpanded ? 'chevron-down' : 'chevron-right'} />
                    {content}
                </IconContainer>
            </div>
            {isExpanded && (
                <div>
                    {React.Children.map(children, (child) =>
                        React.cloneElement(child as React.ReactElement<any>, {
                            selectedId: selectedId,
                            onSelect: handleSelect,
                        })
                    )}
                </div>
            )}
        </TreeContainer>
    );
};
