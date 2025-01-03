/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { CSSProperties, useState } from 'react';
import styled from '@emotion/styled';
import {
    HelperPaneBodyProps,
    HelperPaneCategoryItemProps,
    HelperPaneCompletionItemProps,
    HelperPaneHeaderProps,
    HelperPaneIconButtonProps,
    HelperPaneProps,
    HelperPaneSectionProps,
    LibraryBrowserProps
} from '../types';
import { Codicon } from '../../../../Codicon/Codicon';
import { Divider } from '../../../../Divider/Divider';
import { SearchBox } from '../../../../SeachBox/SearchBox';
import Typography from '../../../../Typography/Typography';
import { Overlay } from '../../../../Commons/Overlay';
import ProgressRing from '../../../../ProgressRing/ProgressRing';

const LibraryBrowserSearchBoxContainer = styled.div`
    margin-bottom: 16px;
`;

const LibraryBrowserBody = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1 1 0;
    padding-inline: 16px;
    overflow-y: auto;
`;

const LibraryBrowserHeader = styled.header`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-inline: 16px;
`;

const LibraryBrowserContainer = styled.div`
    width: 55%;
    height: 70%;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    padding: 16px;
    border-radius: 8px;
    background-color: var(--vscode-dropdown-background);
    box-shadow: 0 3px 8px rgb(0 0 0 / 0.2);
    z-index: 1001;
`;

const IconButtonContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;

    & p,
    & i {
        color: var(--vscode-button-background);
    }

    & p:hover,
    & i:hover {
        color: var(--vscode-button-hoverBackground);
    }
`;

const FooterBody = styled.div`
    padding-inline: 8px;
`;

const FooterContainer = styled.footer`
    display: flex;
    flex-direction: column;
`;

const CompletionItemOuterContainer = styled.div<{ level: number }>`
    margin-bottom: 2px;
    padding-left: ${({ level }: { level: number }) => level * 16}px;
`;

const CompletionItemContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 2px;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
        background-color: var(--vscode-list-hoverBackground);
    }
`;

const CompletionItemGroupContainer = styled.div`
    display: flex;
    flex-direction: column;
`;

const CategoryItemContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px;
    margin-block: 4px;
    border: 1px solid var(--vscode-editorWidget-border);
    border-radius: 8px;
    cursor: pointer;

    &:hover {
        background-color: var(--vscode-list-hoverBackground);
    }
`;

const CollapseButton = styled.div`
    cursor: pointer;

    & p {
        color: var(--vscode-button-background);
    }

    & p:hover {
        color: var(--vscode-button-hoverBackground);
    }
`;

const SectionBody = styled.div<{ columns?: number }>`
    display: grid;
    grid-template-columns: 1fr;
    ${({ columns }: { columns?: number }) =>
        columns &&
        `
        grid-template-columns: repeat(auto-fit, minmax(calc(${100 / columns}% - ${8 * (columns - 1)}px), 130px));
        column-gap: 8px;
    `}
`;

const SectionContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
`;

const ProgressRingContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
`;

const BodyContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    flex: 1 1 0;
    padding-inline: 8px;
    overflow-y: auto;
`;

const SearchBoxContainer = styled.div`
    padding-top: 8px;
    padding-inline: 8px;
`;

const TitleContainer = styled.div<{ isLink?: boolean }>`
    display: flex;
    align-items: center;
    gap: 4px;
    ${({ isLink }: { isLink?: boolean }) =>
        isLink &&
        `
        cursor: pointer;
    `}
`;

const HeaderContainer = styled.header`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-inline: 8px;
`;

const HeaderContainerWithSearch = styled.div`
    display: flex;
    flex-direction: column;
`;

const DropdownBody = styled.div<{ sx?: CSSProperties }>`
    display: flex;
    flex-direction: column;
    width: 350px;
    height: 300px;
    margin-block: 2px;
    padding: 8px;
    border-radius: 8px;
    color: var(--input-foreground);
    background-color: var(--vscode-dropdown-background);
    box-shadow: 0 3px 8px rgb(0 0 0 / 0.2);
    ${({ sx }: { sx?: CSSProperties }) => sx}
`;

const LibraryBrowserSubSection: React.FC<HelperPaneSectionProps> = ({
    title,
    columns = 1,
    collapsible,
    defaultCollapsed = false,
    collapsedItemsCount = 10,
    children
}) => {
    const [isCollapsed, setIsCollapsed] = useState<boolean>(defaultCollapsed);
    const items = React.Children.toArray(children);
    const visibleItems = isCollapsed ? items.slice(0, collapsedItemsCount) : items;
    const isItemsOverflowing = items.length > collapsedItemsCount;

    return (
        <SectionContainer>
            <Typography variant="body3">{title}</Typography>
            <SectionBody columns={columns}>
                {visibleItems.length > 0 ? visibleItems : <Typography variant="body3">No items found.</Typography>}
            </SectionBody>
            {collapsible && isItemsOverflowing && (
                <CollapseButton onClick={() => setIsCollapsed(!isCollapsed)}>
                    <Typography variant="caption">{isCollapsed ? 'Show more' : 'Show less'}</Typography>
                </CollapseButton>
            )}
        </SectionContainer>
    );
};

const LibraryBrowserSection: React.FC<HelperPaneSectionProps> = ({
    title,
    columns = 1,
    collapsible,
    defaultCollapsed = false,
    collapsedItemsCount = 10,
    children
}) => {
    const [isCollapsed, setIsCollapsed] = useState<boolean>(defaultCollapsed);
    const items = React.Children.toArray(children);
    const visibleItems = isCollapsed ? items.slice(0, collapsedItemsCount) : items;
    const isItemsOverflowing = items.length > collapsedItemsCount;

    return (
        <SectionContainer>
            <Typography variant="h3" sx={{ margin: 0 }}>
                {title}
            </Typography>
            <SectionBody columns={columns}>
                {visibleItems.length > 0 ? visibleItems : <Typography variant="body3">No items found.</Typography>}
            </SectionBody>
            {collapsible && isItemsOverflowing && (
                <CollapseButton onClick={() => setIsCollapsed(!isCollapsed)}>
                    <Typography variant="body2">{isCollapsed ? 'Show more' : 'Show less'}</Typography>
                </CollapseButton>
            )}
        </SectionContainer>
    );
};

const LibraryBrowser: React.FC<LibraryBrowserProps> = ({ children, isLoading = true, searchValue, onSearch, onClose }) => {
    return (
        <>
            <Overlay
                sx={{ background: 'var(--vscode-editor-inactiveSelectionBackground)', opacity: 0.4 }}
                onClose={onClose}
            />
            <LibraryBrowserContainer>
                <LibraryBrowserHeader>
                    <Typography variant="h2" sx={{ margin: 0 }}>
                        Library Browser
                    </Typography>
                    <Codicon name="close" onClick={onClose} />
                </LibraryBrowserHeader>
                <Divider />
                <LibraryBrowserSearchBoxContainer>
                    <SearchBox placeholder="Search" value={searchValue} onChange={onSearch} />
                </LibraryBrowserSearchBoxContainer>
                <LibraryBrowserBody>
                    {isLoading ? (
                        <ProgressRingContainer>
                            <ProgressRing />
                        </ProgressRingContainer>
                    ) : (
                        children
                    )}
                </LibraryBrowserBody>
            </LibraryBrowserContainer>
        </>
    );
};

const IconButton: React.FC<HelperPaneIconButtonProps> = ({ title, getIcon, onClick }) => {
    return (
        <IconButtonContainer onClick={onClick}>
            {getIcon && getIcon()}
            <Typography variant="body3">{title}</Typography>
        </IconButtonContainer>
    );
};

const Footer: React.FC = ({ children }) => {
    return (
        <FooterContainer>
            <Divider />
            <FooterBody>{children}</FooterBody>
        </FooterContainer>
    );
};

const CompletionItem: React.FC<HelperPaneCompletionItemProps> = ({ getIcon, level = 0, label, type, onClick }) => {
    return (
        <CompletionItemOuterContainer level={level}>
            <CompletionItemContainer onClick={onClick}>
                {getIcon && getIcon()}
                <Typography variant="body3" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {label}
                </Typography>
                {type && (
                    <Typography variant="body3" sx={{ color: 'var(--vscode-terminal-ansiGreen)' }}>
                        {type}
                    </Typography>
                )}
            </CompletionItemContainer>
        </CompletionItemOuterContainer>
    );
};

const CompletionItemGroup: React.FC = ({ children }) => {
    return <CompletionItemGroupContainer>{children}</CompletionItemGroupContainer>;
};

const CategoryItem: React.FC<HelperPaneCategoryItemProps> = ({ label, onClick }) => {
    return (
        <CategoryItemContainer onClick={onClick}>
            <Typography variant="body3">{label}</Typography>
            <Codicon name="chevron-right" />
        </CategoryItemContainer>
    );
};

const SubSection: React.FC<HelperPaneSectionProps> = ({
    title,
    columns = 1,
    collapsible,
    defaultCollapsed = false,
    collapsedItemsCount = 10,
    children
}) => {
    const [isCollapsed, setIsCollapsed] = useState<boolean>(defaultCollapsed);
    const items = React.Children.toArray(children);
    const visibleItems = isCollapsed ? items.slice(0, collapsedItemsCount) : items;
    const isItemsOverflowing = items.length > collapsedItemsCount;

    return (
        <SectionContainer>
            <Typography variant="body3">{title}</Typography>
            <SectionBody columns={columns}>
                {visibleItems.length > 0 ? visibleItems : <Typography variant="body3">No items found.</Typography>}
            </SectionBody>
            {collapsible && isItemsOverflowing && (
                <CollapseButton onClick={() => setIsCollapsed(!isCollapsed)}>
                    <Typography variant="caption">{isCollapsed ? 'Show more' : 'Show less'}</Typography>
                </CollapseButton>
            )}
        </SectionContainer>
    );
};

const Section: React.FC<HelperPaneSectionProps> = ({
    title,
    columns = 1,
    collapsible,
    defaultCollapsed = false,
    collapsedItemsCount = 10,
    children
}) => {
    const [isCollapsed, setIsCollapsed] = useState<boolean>(defaultCollapsed);
    const items = React.Children.toArray(children);
    const visibleItems = isCollapsed ? items.slice(0, collapsedItemsCount) : items;
    const isItemsOverflowing = items.length > collapsedItemsCount;

    return (
        <SectionContainer>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {title}
            </Typography>
            <SectionBody columns={columns}>
                {visibleItems.length > 0 ? visibleItems : <Typography variant="body3">No items found.</Typography>}
            </SectionBody>
            {collapsible && isItemsOverflowing && (
                <CollapseButton onClick={() => setIsCollapsed(!isCollapsed)}>
                    <Typography variant="caption">{isCollapsed ? 'Show more' : 'Show less'}</Typography>
                </CollapseButton>
            )}
        </SectionContainer>
    );
};

const Body: React.FC<HelperPaneBodyProps> = ({ children, isLoading = true }) => {
    return (
        <BodyContainer>
            {isLoading ? (
                <ProgressRingContainer>
                    <ProgressRing />
                </ProgressRingContainer>
            ) : React.Children.toArray(children).length > 0 ? (
                children
            ) : (
                <Typography variant="body3">No items found.</Typography>
            )}
        </BodyContainer>
    );
};

const Header: React.FC<HelperPaneHeaderProps> = ({ title, onBack, onClose, searchValue, onSearch }) => {
    return (
        <HeaderContainerWithSearch>
            <HeaderContainer>
                <TitleContainer isLink={!!onBack} onClick={onBack}>
                    {onBack && <Codicon name="chevron-left" />}
                    {onBack ? (
                        <Typography variant="caption">{title}</Typography>
                    ) : (
                        <Typography variant="body1">{title}</Typography>
                    )}
                </TitleContainer>
                {onClose && <Codicon name="close" onClick={onClose} />}
            </HeaderContainer>
            {onSearch && (
                <SearchBoxContainer>
                    <SearchBox placeholder="Search" value={searchValue} onChange={onSearch} />
                </SearchBoxContainer>
            )}
            <Divider />
        </HeaderContainerWithSearch>
    );
};

const HelperPane: React.FC<HelperPaneProps> & {
    Header: typeof Header;
    Body: typeof Body;
    Section: typeof Section;
    SubSection: typeof SubSection;
    CategoryItem: typeof CategoryItem;
    CompletionItem: typeof CompletionItem;
    CompletionItemGroup: typeof CompletionItemGroup;
    Footer: typeof Footer;
    IconButton: typeof IconButton;
    LibraryBrowser: typeof LibraryBrowser;
    LibraryBrowserSection: typeof LibraryBrowserSection;
    LibraryBrowserSubSection: typeof LibraryBrowserSubSection;
} = ({ children, sx }: HelperPaneProps) => {
    return <DropdownBody sx={sx}>{children}</DropdownBody>;
};

HelperPane.Header = Header;
HelperPane.Body = Body;
HelperPane.Section = Section;
HelperPane.SubSection = SubSection;
HelperPane.CategoryItem = CategoryItem;
HelperPane.CompletionItem = CompletionItem;
HelperPane.CompletionItemGroup = CompletionItemGroup;
HelperPane.Footer = Footer;
HelperPane.IconButton = IconButton;
HelperPane.LibraryBrowser = LibraryBrowser;
HelperPane.LibraryBrowserSection = LibraryBrowserSection;
HelperPane.LibraryBrowserSubSection = LibraryBrowserSubSection;

export default HelperPane;
