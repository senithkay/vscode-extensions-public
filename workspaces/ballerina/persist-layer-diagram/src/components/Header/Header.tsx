/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from 'react';
import styled from '@emotion/styled';
import { Colors } from '../../resources';
import { NodeCollapser } from '../Controls/NodeCollapser';

interface HeaderProps {
    collapsedMode: boolean;
    setIsCollapsedMode: (collapsedMode: boolean) => void;
}

const HeaderContainer = styled.div`
    align-items: center;
    color: ${Colors.DEFAULT_TEXT};
    display: flex;
    flex-direction: row;
    font-family: GilmerBold;
    font-size: 16px;
    height: 50px;
    justify-content: space-between;
    min-width: 350px;
    padding-inline: 10px;
    width: calc(100vw - 20px);
`;

export const Title = styled.div(() => ({
    color: 'var(--vscode-sideBarSectionHeader-foreground)'
}));

export function HeaderWidget(props: HeaderProps) {
    const {collapsedMode, setIsCollapsedMode} = props;

    return (
        <HeaderContainer>
            <Title>Entity Relationship Diagram</Title>
            <NodeCollapser collapsedMode={collapsedMode} setIsCollapsedMode={setIsCollapsedMode} />
        </HeaderContainer>
    );
}
