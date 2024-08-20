/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import styled from "@emotion/styled";
import { Colors } from "../../../resources/constants";
import { Button, Codicon } from "@wso2-enterprise/ui-toolkit";

const ViewContainer = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 3000;
    background-color: ${Colors.SURFACE_BRIGHT};
    padding: 20px;
`;

const TopBar = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px 16px;
`;

interface PopupPanelProps {
    children: React.ReactNode;
    onClose: () => void;
}

export function PopupPanel(props: PopupPanelProps) {
    const { children, onClose } = props;

    return (
        <ViewContainer>
            <TopBar>
                <div></div>
                <Button appearance="icon" onClick={onClose}>
                    <Codicon name="close" />
                </Button>
            </TopBar>
            {children}
        </ViewContainer>
    );
}

export default PopupPanel;
