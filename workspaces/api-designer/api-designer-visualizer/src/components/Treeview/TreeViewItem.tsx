import React from 'react';
import styled from "@emotion/styled";

interface ItemContainerProps {
    isSelected: boolean;
}
const ItemContainer = styled.div<ItemContainerProps>`
    padding-left: 20px;
    cursor: pointer;
    background-color: ${(props: ItemContainerProps) => props.isSelected ? "var(--vscode-editorHoverWidget-background)" : "transparent"};
    &:hover {
        background-color: var(--vscode-editorHoverWidget-background);
    }
`;

interface TreeViewItemProps {
    id: string;
    children: React.ReactNode;
    selectedId?: string;
    onSelect?: (id: string) => void;
}

export const TreeViewItem: React.FC<TreeViewItemProps> = ({ id, children, selectedId, onSelect }) => {
    const handleClick = () => {
        if (onSelect) {
            onSelect(id);
        }
    };
    return (
        <ItemContainer isSelected={selectedId === id} onClick={handleClick}>
            {children}
        </ItemContainer>
    );
};
