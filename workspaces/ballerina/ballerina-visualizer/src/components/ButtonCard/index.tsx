/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */

import React from "react";
import { Codicon, LinkButton } from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";
import { Colors } from "../../resources/constants";

const CardContainer = styled.div<{ active?: boolean }>`
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: flex-start;
    gap: 16px;
    width: 100%;
    padding: 16px;
    border-radius: 4px;
    border: 2px solid ${(props: { active: boolean }) => (props.active ? Colors.PRIMARY : Colors.OUTLINE_VARIANT)};
    background-color: ${(props: { active: boolean }) => (props.active ? Colors.PRIMARY_CONTAINER : Colors.SURFACE_DIM)};
    cursor: pointer;
    &:hover {
        background-color: ${Colors.PRIMARY_CONTAINER};
        border: 2px solid ${Colors.PRIMARY};
    }
`;

const Text = styled.p`
    font-size: 14px;
    color: ${Colors.ON_SURFACE};
    margin: 0;
`;

const Title = styled(Text)`
    text-transform: capitalize;
    font-weight: bold;
`;

const Caption = styled(Text)`
    font-size: 11px;
    font-weight: bold;
    opacity: 0.6;
`;

const Description = styled(Text)`
    opacity: 0.8;
    margin-top: 4px;
`;

const ContentContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    gap: 4px;
`;

const IconContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
`;

const ActionButton = styled(LinkButton)`
    padding: 8px 4px;
`;

export interface ButtonCardProps {
    title: string;
    caption?: string;
    description: string;
    icon?: React.ReactNode;
    active?: boolean;
    onClick: () => void;
}

export function ButtonCard(props: ButtonCardProps) {
    const { title, caption, description, icon, active, onClick } = props;
    return (
        <CardContainer onClick={onClick} active={active ?? false}>
            {icon && <IconContainer>{icon}</IconContainer>}
            <ContentContainer>
                {caption && <Caption>{caption}</Caption>}
                <Title>{title}</Title>
                <Description>{description}</Description>
            </ContentContainer>
        </CardContainer>
    );
}

export default ButtonCard;
