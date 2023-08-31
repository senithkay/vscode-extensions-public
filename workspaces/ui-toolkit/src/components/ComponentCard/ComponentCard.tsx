/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from "react";
import cn from "classnames";

import styled from "@emotion/styled";

interface CardContainerProps {
	sx?: any;
}

const CardContainer = styled.div<CardContainerProps>`
    // Flex Props
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 10px;
    // End Flex Props
    // Sizing Props
    width: 120px;
    padding: 5px;
    // End Sizing Props
    // Border Props
    border-radius: 3px;
    border-style: solid;
    border-width: 1px;
    border-color: var(--vscode-panel-border);
    cursor: pointer;
    &:hover, &.active {
        border-color: var(--vscode-focusBorder);
    };
	&.not-allowed {
    	cursor: not-allowed;
  	};
	${(props: CardContainerProps) => props.sx};
`;

export interface ComponentCardProps {
	id?: string; // Identifier for the component
	description?: string;
	isSelected?: boolean;
	disabled?: boolean;
	sx?: any;
	children?: React.ReactNode;
    onClick?: (value: string) => void;
}

export const ComponentCard: React.FC<ComponentCardProps> = (props: ComponentCardProps) => {
    const { id, sx, description, isSelected, disabled, children, onClick } = props;

    const handleComponentClick = () => {
        onClick(id);
    };

    return (
        <CardContainer id={`card-select-${id}`} className={cn({ "active": isSelected, 'not-allowed': disabled })} sx={sx} onClick={handleComponentClick} title={description}>
            {children}
        </CardContainer>
    );
};
