/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useContext } from 'react';
import styled from '@emotion/styled';
import { Button, ThemeColors } from '@wso2-enterprise/ui-toolkit';
import { DiagramContext } from '../common';


const HeaderContainer = styled.div`
    align-items: center;
    color: ${ThemeColors.ON_SURFACE};
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

export const Title: React.FC<any> = styled.div`
    color: ThemeColors.ON_SURFACE
`;

export function HeaderWidget() {
    const { selectedNodeId, setSelectedNodeId } = useContext(DiagramContext);

    return (
        <HeaderContainer>
            {selectedNodeId ?
                <Title>Composition Diagram</Title> :
                <Title>Type Diagram</Title>
            }
            {selectedNodeId && (
                <Button
                    appearance="primary"
                    onClick={() => setSelectedNodeId(undefined)}
                    tooltip="Open Type Diagram"
                >
                    Switch to Type Diagram
                </Button>
            )}
        </HeaderContainer>
    );
}
