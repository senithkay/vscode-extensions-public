/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { CSSProperties, useState } from 'react';
import { createPortal } from 'react-dom';
import styled from '@emotion/styled';
import {
    HelperPaneBodyProps,
    HelperPaneCategoryItemProps,
    HelperPaneCompletionItemProps,
    HelperPaneFooterProps,
    HelperPaneHeaderProps,
    HelperPaneIconButtonProps,
    HelperPaneProps,
    HelperPaneSectionProps,
    LibraryBrowserProps,
    LoadingItemProps,
    PanelsProps,
    PanelTabProps,
    PanelViewProps,
    StyleBase
} from '../types';
import { Codicon } from '../../../../Codicon/Codicon';
import { Divider } from '../../../../Divider/Divider';
import { SearchBox } from '../../../../SeachBox/SearchBox';
import Typography from '../../../../Typography/Typography';
import { Overlay } from '../../../../Commons/Overlay';
import ProgressRing from '../../../../ProgressRing/ProgressRing';
import { HelperPanePanelProvider, useHelperPanePanelContext } from './context';
import { HELPER_PANE_HEIGHT, HELPER_PANE_WIDTH } from '../../../constants';

const PanelViewContainer = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
`;

const PanelTabContainer = styled.div<{ isActive: boolean }>`
    padding: 4px 0;
    color: var(--panel-tab-foreground);
    cursor: pointer;
    ${({ isActive }: { isActive: boolean }) =>
        isActive &&
        `
        color: var(--panel-tab-active-foreground);
        border-bottom: 1px solid var(--panel-tab-active-border);
    `}
`;

const ViewContainer = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1 1 0;
    overflow-y: auto;
`;

const TabContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 32px;
`;

const PanelContainer = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 16px;
`;

const LibraryBrowserSearchBoxContainer = styled.div`
    margin-bottom: 16px;
`;

const LibraryBrowserBody = styled.div`
    display: flex;
    flex-direction: column;
    flex: 1 1 0;
    padding: 16px;
    overflow-y: auto;
    scrollbar-color: auto;
    border: 1px solid var(--vscode-dropdown-border);
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
    z-index: 3002;
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

const CategoryItemContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
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

const LoadingBox = styled.div`
    width: 100%;
    height: 16px;
    margin-bottom: 2px;
    background: var(--vscode-editor-background);
    animation: loading 1s infinite alternate;

    @keyframes loading {
        0% {
            background: var(--vscode-editor-background);
        }
        100% {
            background: var(--vscode-editor-inactiveSelectionBackground);
        }
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
    gap: 4px;
    margin-bottom: 16px;
`;

const ProgressRingContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
`;

const BodyContainer = styled.div<StyleBase>`
    width: 100%;
    display: flex;
    flex-direction: column;
    flex: 1 1 0;
    padding-inline: 8px;
    overflow-y: auto;

    ${({ sx }: StyleBase) => sx}
`;

const SearchBoxContainer = styled.div`
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
    gap: 8px;
`;

const DropdownBody = styled.div<{ sx?: CSSProperties }>`
    display: flex;
    flex-direction: column;
    width: ${HELPER_PANE_WIDTH}px;
    height: ${HELPER_PANE_HEIGHT}px;
    padding: 8px;
    border-radius: 2px;
    color: var(--input-foreground);
    background-color: var(--vscode-dropdown-background);
    ${({ sx }: { sx?: CSSProperties }) => sx}
`;

const LoadingGroup: React.FC<LoadingItemProps> = ({ columns }) => {
    const boxCount = columns ? columns * 2 : 2;

    const boxes = [];
    for (let i = 0; i < boxCount; i++) {
        boxes.push(<LoadingBox key={i} />);
    }
    return (
        <>
            {boxes}
        </>
    );
}

const PanelView: React.FC<PanelViewProps> = ({ children, id }) => {
    const { activePanelIndex } = useHelperPanePanelContext();
    
    return (
        <>
            {activePanelIndex === id && (
                <PanelViewContainer>
                    {children}
                </PanelViewContainer>
            )}
        </>
    );
};
PanelView.displayName = 'PanelView';

const PanelTab: React.FC<PanelTabProps> = ({ title, id }) => {
    const { activePanelIndex, setActivePanelIndex } = useHelperPanePanelContext();

    return (
        <PanelTabContainer isActive={activePanelIndex === id} onClick={() => setActivePanelIndex(id)}>
            <Typography variant="body3">{title}</Typography>
        </PanelTabContainer>
    );
};
PanelTab.displayName = 'PanelTab';

const Panels: React.FC<PanelsProps> = ({ children }) => {
    const [activePanelIndex, setActivePanelIndex] = useState<number>(0);

    const tabs = React.Children.toArray(children).filter(child => 
        React.isValidElement(child) && (child.type as any).displayName === 'PanelTab'
    );

    const views = React.Children.toArray(children).filter(child => 
        React.isValidElement(child) && (child.type as any).displayName === 'PanelView'
    );
    
    return (
        <HelperPanePanelProvider activePanelIndex={activePanelIndex} setActivePanelIndex={setActivePanelIndex}>
            <PanelContainer>
                <TabContainer>
                    {tabs}
                </TabContainer>
                <ViewContainer>
                    {views}
                </ViewContainer>
            </PanelContainer>
        </HelperPanePanelProvider>
    );
};

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
            <Typography variant="body3" sx={{ fontStyle: "italic" }}>{title}</Typography>
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
    children,
    titleSx
}) => {
    const [isCollapsed, setIsCollapsed] = useState<boolean>(defaultCollapsed);
    const items = React.Children.toArray(children);
    const visibleItems = isCollapsed ? items.slice(0, collapsedItemsCount) : items;
    const isItemsOverflowing = items.length > collapsedItemsCount;

    return (
        <SectionContainer>
            <Typography variant="h3" sx={{ margin: 0, ...titleSx }}>
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

const LibraryBrowser: React.FC<LibraryBrowserProps> = ({
    children,
    loading = false,
    searchValue,
    titleSx,
    onSearch,
    onClose,
}) => {
    return createPortal(
        <>
            <Overlay
                sx={{ background: "var(--vscode-editor-inactiveSelectionBackground)", opacity: 0.4 }}
                onClose={onClose}
            />
            <LibraryBrowserContainer>
                <LibraryBrowserHeader>
                    <Typography variant="h2" sx={{ margin: 0, ...titleSx }}>
                        Library Browser
                    </Typography>
                    <Codicon name="close" onClick={onClose} />
                </LibraryBrowserHeader>
                <Divider />
                <LibraryBrowserSearchBoxContainer>
                    <SearchBox placeholder="Search" value={searchValue} onChange={onSearch} />
                </LibraryBrowserSearchBoxContainer>
                <LibraryBrowserBody>
                    {loading ? (
                        <ProgressRingContainer>
                            <ProgressRing />
                        </ProgressRingContainer>
                    ) : (
                        children
                    )}
                </LibraryBrowserBody>
            </LibraryBrowserContainer>
        </>,
        document.body
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

const Footer: React.FC<HelperPaneFooterProps> = ({ children }) => {
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

const CategoryItem: React.FC<HelperPaneCategoryItemProps> = ({ label, labelSx, onClick, getIcon }) => {
    return (
        <CategoryItemContainer onClick={onClick}>
            {getIcon && getIcon()}
            <Typography variant="body2" sx={labelSx}>{label}</Typography>
            <Codicon sx={{ marginLeft: 'auto' }} name="chevron-right" />
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
            <Typography variant="body3" sx={{ fontStyle: "italic" }}>{title}</Typography>
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
    loading = false,
    children,
    titleSx
}) => {
    const [isCollapsed, setIsCollapsed] = useState<boolean>(defaultCollapsed);
    const items = React.Children.toArray(children);
    const visibleItems = isCollapsed ? items.slice(0, collapsedItemsCount) : items;
    const isItemsOverflowing = items.length > collapsedItemsCount;

    return (
        <SectionContainer>
            <Typography variant="body2" sx={titleSx}>
                {title}
            </Typography>
            <SectionBody columns={columns}>
                {loading ? (
                    <LoadingGroup columns={columns} />
                ) : visibleItems.length > 0 ? (
                    visibleItems
                ) : (
                    <Typography variant="body3">No items found.</Typography>
                )}
            </SectionBody>
            {collapsible && isItemsOverflowing && (
                <CollapseButton onClick={() => setIsCollapsed(!isCollapsed)}>
                    <Typography variant="caption">{isCollapsed ? 'Show more' : 'Show less'}</Typography>
                </CollapseButton>
            )}
        </SectionContainer>
    );
};

const Body: React.FC<HelperPaneBodyProps> = ({ children, loading = false, className, sx }) => {
    return (
        <BodyContainer className={className} sx={sx}>
            {loading ? (
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

const Header: React.FC<HelperPaneHeaderProps> = ({ title, titleSx, onBack, onClose, searchValue, onSearch }) => {
    return (
        <>
            <HeaderContainerWithSearch>
                {title && (
                    <HeaderContainer>
                        <TitleContainer isLink={!!onBack} onClick={onBack}>
                            {onBack && <Codicon name="chevron-left" />}
                            {onBack ? (
                                <Typography variant="caption" sx={titleSx}>{title}</Typography>
                            ) : (
                                <Typography sx={{ margin: 0, ...titleSx }}>{title}</Typography>
                            )}
                        </TitleContainer>
                        {onClose && <Codicon name="close" onClick={onClose} />}
                    </HeaderContainer>
                )}
                {onSearch && (
                    <SearchBoxContainer>
                        <SearchBox placeholder="Search" value={searchValue} onChange={onSearch} />
                    </SearchBoxContainer>
                )}
            </HeaderContainerWithSearch>
            <Divider />
        </>
    );
};

const HelperPane: React.FC<HelperPaneProps> & {
    Header: typeof Header;
    Body: typeof Body;
    Section: typeof Section;
    SubSection: typeof SubSection;
    CategoryItem: typeof CategoryItem;
    CompletionItem: typeof CompletionItem;
    Footer: typeof Footer;
    IconButton: typeof IconButton;
    LibraryBrowser: typeof LibraryBrowser;
    LibraryBrowserSection: typeof LibraryBrowserSection;
    LibraryBrowserSubSection: typeof LibraryBrowserSubSection;
    Panels: typeof Panels;
    PanelTab: typeof PanelTab;
    PanelView: typeof PanelView;
} = ({ children, sx }: HelperPaneProps) => {
    return <DropdownBody sx={sx}>{children}</DropdownBody>;
};

HelperPane.Header = Header;
HelperPane.Body = Body;
HelperPane.Section = Section;
HelperPane.SubSection = SubSection;
HelperPane.CategoryItem = CategoryItem;
HelperPane.CompletionItem = CompletionItem;
HelperPane.Footer = Footer;
HelperPane.IconButton = IconButton;
HelperPane.LibraryBrowser = LibraryBrowser;
HelperPane.LibraryBrowserSection = LibraryBrowserSection;
HelperPane.LibraryBrowserSubSection = LibraryBrowserSubSection;
HelperPane.Panels = Panels;
HelperPane.PanelTab = PanelTab;
HelperPane.PanelView = PanelView;

export default HelperPane;
