/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import styled from "@emotion/styled";
import React, { ReactNode } from "react";

const Subtitle1 = styled.p`
    font-weight: regular;
    font-size: 16px;
    letter-spacing: 0.15px;
    text-transform: sentence;
`;

const Subtitle2 = styled.p`
    font-weight: regular;
    font-size: 14px;
    letter-spacing: 0.1px;
    text-transform: sentence;
`;

const Body1 = styled.p`
    font-weight: regular;
    font-size: 16px;
    letter-spacing: 0.5px;
    text-transform: sentence;
`;

const Body2 = styled.p`
    font-weight: regular;
    font-size: 14px;
    letter-spacing: 0.25px;
    text-transform: sentence;
`;

const Button = styled.p`
    font-weight: medium;
    font-size: 14px;
    letter-spacing: 1.25px;
    text-transform: uppercase;
`;

const Caption = styled.p`
    font-weight: regular;
    font-size: 12px;
    letter-spacing: 0.4px;
    text-transform: sentence;
`;

const Overline = styled.p`
    font-weight: medium;
    font-size: 10px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
`;

export interface TypographyProps {
    id?: string;
    className?: string;
    children: ReactNode;
    variant?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
    | "subtitle1" | "subtitle2"
    | "body1" | "body2"
    | "button"
    | "caption"
    | "overline";
    sx?: any;
}

export const Typography: React.FC<TypographyProps> = (props: TypographyProps) => {
    const { id, className, children, variant, sx } = props;

    switch (variant) {
        case "h1":
            return <h1 id={id} className={className} style={sx}>{children}</h1>;
        case "h2":
            return <h2 id={id} className={className} style={sx}>{children}</h2>;
        case "h3":
            return <h3 id={id} className={className} style={sx}>{children}</h3>;
        case "h4":
            return <h4 id={id} className={className} style={sx}>{children}</h4>;
        case "h5":
            return <h5 id={id} className={className} style={sx}>{children}</h5>;
        case "h6":
            return <h6 id={id} className={className} style={sx}>{children}</h6>;
        case "subtitle1":
            return <Subtitle1 id={id} className={className} style={sx}>{children}</Subtitle1>;
        case "subtitle2":
            return <Subtitle2 id={id} className={className} style={sx}>{children}</Subtitle2>;
        case "body1":
            return <Body1 id={id} className={className} style={sx}>{children}</Body1>;
        case "body2":
            return <Body2 id={id} className={className} style={sx}>{children}</Body2>;
        case "button":
            return <Button id={id} className={className} style={sx}>{children}</Button>;
        case "caption":
            return <Caption id={id} className={className} style={sx}>{children}</Caption>;
        case "overline":
            return <Overline id={id} className={className} style={sx}>{children}</Overline>;
        default:
            return <p id={id} className={className} style={sx}>{children}</p>;
    }
};
