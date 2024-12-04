/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from 'react';
import styled from '@emotion/styled';
import {
    HelperPaneCategoryItemProps,
    HelperPaneCompletionItemProps,
    HelperPaneHeaderProps,
    HelperPaneIconButtonProps,
    HelperPaneProps,
    HelperPaneSectionProps
} from '../types';
import { Codicon } from '../../../../Codicon/Codicon';
import Typography from '../../../../Typography/Typography';
import { Divider } from '../../../../Divider/Divider';
import { SearchBox } from '../../../../SeachBox/SearchBox';

const IconButtonContainer = styled.button`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const FooterContainer = styled.footer`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const CompletionItemContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const CategoryItemContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px;
`;

const SectionContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const BodyContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
`;

const HeaderContainer = styled.header`
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const HeaderContainerWithSearch = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const DropdownBody = styled.div`
    width: 350px;
    margin-block: 2px;
    padding-top: 8px;
    border-radius: 8px;
    background-color: var(--vscode-dropdown-background);
    box-shadow: 0 3px 8px rgb(0 0 0 / 0.2);
`;

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
            {children}
        </FooterContainer>
    );
};

const CompletionItem: React.FC<HelperPaneCompletionItemProps> = ({ getIcon, label, type }) => {
    return (
        <CompletionItemContainer>
            {getIcon && getIcon()}
            <Typography variant="body3">{label}</Typography>
            {type && <Typography variant="body3">{type}</Typography>}
        </CompletionItemContainer>
    );
};

const CategoryItem: React.FC<HelperPaneCategoryItemProps> = ({ label, onClick }) => {
    return (
        <CategoryItemContainer onClick={onClick}>
            <Typography variant="body3">{label}</Typography>
            <Codicon name="chevron-right" />
        </CategoryItemContainer>
    );
};

const Section: React.FC<HelperPaneSectionProps> = ({ title, children }) => {
    return (
        <SectionContainer>
            <Typography variant="body2">{title}</Typography>
            <Divider />
            {children}
        </SectionContainer>
    );
};

const Body: React.FC = ({ children }) => {
    return <BodyContainer>{children}</BodyContainer>;
};

const Header: React.FC<HelperPaneHeaderProps> = ({ title, onBack, onClose, searchValue, onSearch }) => {
    return (
        <HeaderContainerWithSearch>
            <HeaderContainer>
                {onBack && <Codicon name="chevron-left" onClick={onBack} />}
                {title && <Typography variant="body1">{title}</Typography>}
                {onClose && <Codicon name="close" onClick={onClose} />}
            </HeaderContainer>
            {onSearch && <SearchBox value={searchValue} onChange={onSearch} />}
            <Divider />
        </HeaderContainerWithSearch>
    );
};

const HelperPane: React.FC<HelperPaneProps> & {
    Header: typeof Header;
    Body: typeof Body;
    Section: typeof Section;
    CategoryItem: typeof CategoryItem;
    CompletionItem: typeof CompletionItem;
    Footer: typeof Footer;
    IconButton: typeof IconButton;
} = ({ children }: HelperPaneProps) => {
    return <DropdownBody>{children}</DropdownBody>;
};

HelperPane.Header = Header;
HelperPane.Body = Body;
HelperPane.Section = Section;
HelperPane.CategoryItem = CategoryItem;
HelperPane.CompletionItem = CompletionItem;
HelperPane.Footer = Footer;
HelperPane.IconButton = IconButton;

export default HelperPane;
