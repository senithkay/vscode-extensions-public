/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from "react";
import * as Icons from "../../assets/icons";

import styled from "@emotion/styled";

interface IconContainerProps {
    sx?: any;
}

const IconContainer = styled.div<IconContainerProps>`
    height: 16px;
    width: 14px;
    cursor: pointer;
    ${(props: IconContainerProps) => props.sx};
`;

export interface IconProps {
	name: string; // Identifier for the icon
    sx?: any;
    onClick?: () => void;
}

export const Icon: React.FC<IconProps> = (props: IconProps) => {
    const { name, sx, onClick } = props;
    const handleComponentClick = () => {
        onClick();
    }
    const SpecificIcon = Icons[name as keyof typeof Icons];
    return (
        <IconContainer sx={sx} onClick={handleComponentClick}>
            {SpecificIcon && <SpecificIcon />}
        </IconContainer>
    );
};
