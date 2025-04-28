/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */

import React from "react";
import { ThemeColors, Tooltip } from "@wso2-enterprise/ui-toolkit";
import styled from "@emotion/styled";
import { BetaSVG } from "../../views/Connectors/Marketplace/BetaSVG";

const Card = styled.div<{ active?: boolean; appearance?: ButtonCardAppearance, disabled?: boolean }>`
    gap: 16px;
    max-width: 42rem;
    padding: 12px;
    border-radius: 4px;
    border: 1px solid
        ${(props: { active: boolean }) => (props.active ? ThemeColors.PRIMARY : ThemeColors.OUTLINE_VARIANT)};
    background-color: ${(props: { active: boolean }) =>
        props.active ? ThemeColors.PRIMARY_CONTAINER : ThemeColors.SURFACE_DIM};
    cursor: ${(props: { disabled: boolean }) => (props.disabled ? 'not-allowed' : 'pointer')};;
    &:hover {
        background-color: ${ThemeColors.PRIMARY_CONTAINER};
        border: 1px solid ${ThemeColors.HIGHLIGHT};
    };
`;

const CardContainer = styled.div<{ active?: boolean }>`
    display: flex;
    gap: 12px;
    align-items: center;
`;

const Text = styled.p`
    font-size: 13px;
    color: ${ThemeColors.ON_SURFACE};
    margin: 0;
`;

interface TextProps {
    truncate?: boolean;
}

const Title = styled(Text)<TextProps>`
    font-weight: bold;
    white-space: ${(props: TextProps) => (props.truncate ? "nowrap" : "normal")};
    overflow: ${(props: TextProps) => (props.truncate ? "hidden" : "visible")};
    text-overflow: ${(props: TextProps) => (props.truncate ? "ellipsis" : "clip")};
    display: flex;
    align-items: center;
    gap: 8px;
`;

const Caption = styled(Text)`
    font-size: 11px;
    font-weight: bold;
    opacity: 0.6;
`;

const Description = styled(Text)<TextProps>`
    opacity: 0.8;
    margin-top: 4px;
    overflow: hidden;
    display: ${(props: TextProps) => (props.truncate ? "block" : "-webkit-box")};
    white-space: ${(props: TextProps) => (props.truncate ? "nowrap" : "normal")};
    text-overflow: ${(props: TextProps) => (props.truncate ? "ellipsis" : "clip")};
    ${(props: TextProps) =>
        !props.truncate &&
        `
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
    `}
`;

const ContentContainer = styled.div`
    flex: 1;
    overflow: hidden;
`;

const IconContainer = styled.div`
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    max-width: 24px;
    > div:first-child {
        width: 24px;
        height: 24px;
        font-size: 24px;
    }
`;

export type ButtonCardAppearance = "large" | "small";

export interface ButtonCardProps {
    title: string;
    caption?: string;
    description?: string;
    icon?: React.ReactNode;
    active?: boolean;
    appearance?: ButtonCardAppearance;
    truncate?: boolean;
    onClick: () => void;
    disabled?: boolean;
    tooltip?: string;
    isBeta?: boolean;
}

export function ButtonCard(props: ButtonCardProps) {
    const {
        title,
        caption,
        description,
        icon,
        active,
        appearance = "large",
        truncate: explicitTruncate,
        onClick,
        disabled,
        tooltip,
        isBeta
    } = props;

    // Apply truncation by default for small appearance if not explicitly set
    const truncate = explicitTruncate !== undefined ? explicitTruncate : appearance === "small";

    return (
        <Tooltip content={tooltip}>
            <Card
                onClick={disabled ? undefined : onClick}
                active={active ?? false}
                appearance={appearance}
                disabled={disabled}
            >
                <CardContainer>
                    {icon && <IconContainer>{icon}</IconContainer>}
                    <ContentContainer>
                        {caption && <Caption>{caption}</Caption>}
                        <Title
                            truncate={truncate}
                        >
                            {title}
                            {isBeta && <BetaSVG />}
                        </Title>
                        {description && <Description truncate={truncate}>{description}</Description>}
                    </ContentContainer>
                </CardContainer>
            </Card>
        </Tooltip>
    );
}

export default ButtonCard;
