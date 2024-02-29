/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from "react";
import { Button, SidePanel, SidePanelBody, SidePanelTitleContainer } from "@wso2-enterprise/ui-toolkit";
import { Colors } from "../../resources/constants";
import styled from "@emotion/styled";
import { CloseIcon } from "../../resources";

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
                // top: "calc(50% - 300px)",
                // left: "calc(50% - 250px)",
                // width: "500px",
                width: "400px",
                // height: "600px",
                // borderRadius: "10px",
                fontFamily: "GilmerRegular",
                backgroundColor: Colors.SURFACE_DIM,
                boxShadow: "0 0 10px 0 rgba(0, 0, 0, 0.1)",
            }}
        >
            <SidePanelTitleContainer>
                <div>Components</div>
                <S.StyledButton appearance="icon" onClick={onClose}>
                    <CloseIcon />
                </S.StyledButton>
            </SidePanelTitleContainer>
            <SidePanelBody>{children}</SidePanelBody>
        </SidePanel>
    );
}
