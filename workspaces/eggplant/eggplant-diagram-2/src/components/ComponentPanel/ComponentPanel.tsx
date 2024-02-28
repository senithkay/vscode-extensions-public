/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import { Button, Codicon, SidePanel, SidePanelBody, SidePanelTitleContainer } from "@wso2-enterprise/ui-toolkit";
import { Colors } from "../../resources/constants";
import styled from "@emotion/styled";

export interface ComponentPanelProps {
    children?: React.ReactNode;
    show: boolean;
    onClose(): void;
}

namespace S {
    export const StyledButton = styled(Button)`
        border-radius: 5px;
    `;
}

export function ComponentPanel(props: ComponentPanelProps) {
    const { children, show, onClose } = props;

    return (
        <SidePanel
            isOpen={show}
            alignmanet="right"
            sx={{
                top: "calc(50% - 300px)",
                left: "calc(50% - 250px)",
                width: "500px",
                height: "600px",
                fontFamily: "GilmerRegular",
                borderRadius: "10px",
                backgroundColor: Colors.SURFACE_DIM,
                boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.1)",
            }}
        >
            <SidePanelTitleContainer>
                <div>Components</div>
                <S.StyledButton onClick={onClose} appearance="icon">
                    <Codicon name="close" />
                </S.StyledButton>
            </SidePanelTitleContainer>
            <SidePanelBody>{children}</SidePanelBody>
        </SidePanel>
    );
}
