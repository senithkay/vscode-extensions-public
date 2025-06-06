/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from 'react';
import styled from "@emotion/styled";
import { Codicon } from '@wso2-enterprise/ui-toolkit';

const IconContainer = styled.div`
    width: 15px;
    height: 20px;
    cursor: pointer;
    border-radius: 5px;
    align-content: center;
    padding: 1px 5px 1px 5px;
    margin-top: 2px;
    color: var(--vscode-list-deemphasizedForeground);
    &:hover, &.active {
        background-color: var(--vscode-toolbar-hoverBackground);
        color: var(--vscode-editor-foreground);
    }
    & img {
        width: 20px;
    }
`;

interface ItemContainerProps {
    isSelected: boolean;
    sx?: any;
}
export const ItemContainer = styled.div<ItemContainerProps>`
    display: flex;
    padding-left: 7px;
    padding-right: 10px;
    cursor: pointer;
    background-color: ${(props: ItemContainerProps) => props.isSelected ? "var(--vscode-editorHoverWidget-background)" : "transparent"};
    &:hover {
        background-color: var(--vscode-list-hoverBackground);
    };
    width: 100%;
    height: 25px;
    justify-content: space-between;
    ${(props: ItemContainerProps) => props.sx}
    & > div {
        display: none;
    }
    &:hover > div {
        display: flex;
    }
`;

interface TreeViewItemProps {
    id: string;
    children: React.ReactNode;
    selectedId?: string;
    sx?: any;
    onSelect?: (id: string) => void;
    onEdit?: (e: any) => void;
    onDelete?: (id: string) => void;
}

export const TreeViewItem: React.FC<TreeViewItemProps> = ({ id, children, selectedId, sx, onSelect, onEdit, onDelete }) => {
    const handleClick = () => {
        if (onSelect) {
            onSelect(id);
        }
    };
    const handleDelete = () => {
        if (onDelete) {
            onDelete(id);
        }
    }

    const handleEdit = (e: any) => {
        if (onDelete) {
            onEdit(e);
        }
    }
    return (
        <ItemContainer sx={sx} isSelected={selectedId === id} onClick={handleClick}>
            {children}
            <div style={{marginRight: '7px'}}>
                {onEdit && (
                    <IconContainer
                        onClick={handleEdit}
                        className="edit-icon">
                        <Codicon name="edit" iconSx={{ fontSize: 15 }} />
                    </IconContainer>
                )}
                {onDelete && (
                    <IconContainer
                        onClick={handleDelete}
                        className="delete-icon">
                        <Codicon name="trash" iconSx={{ fontSize: 15 }} />
                    </IconContainer>
                )}
            </div>
        </ItemContainer>
    );
};
