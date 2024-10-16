/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import styled from "@emotion/styled";
import React from "react";

const removeMargin = {
    margin: 'unset'
}

const Subtitle1 = styled.p`
    font-weight: normal;
    font-size: 16px;
    letter-spacing: 0.15px;
    ${removeMargin};
`;

const Subtitle2 = styled.p`
    font-weight: bold;
    font-size: 14px;
    letter-spacing: 0.09px;
    ${removeMargin};
`;

const Body1 = styled.p`
    font-weight: normal;
    font-size: 16px;
    letter-spacing: 0.15px;
    ${removeMargin};
`;

const Body2 = styled.p`
    font-weight: normal;
    font-size: 14px;
    letter-spacing: 0.149px;
    ${removeMargin};
`;

const Body3 = styled.p`
    font-weight: normal;
    font-size: 13px;
    ${removeMargin};
`;

const Button = styled.p`
    font-weight: bold;
    font-size: 14px;
    letter-spacing: 0.39px;
    text-transform: uppercase;
    ${removeMargin};
`;

const Caption = styled.p`
    font-weight: normal;
    font-size: 12px;
    letter-spacing: 0.39px;
    ${removeMargin};
`;

const Overline = styled.p`
    font-weight: normal;
    font-size: 10px;
    letter-spacing: 0.99px;
    text-transform: uppercase;
    ${removeMargin};
`;

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
    id?: string;
    className?: string;
    variant?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
    | "subtitle1" | "subtitle2"
    | "body1" | "body2" | "body3"
    | "button"
    | "caption"
    | "overline";
    sx?: any;
}

export const Typography: React.FC<TypographyProps> = 
    props => {
        const { id, className, children, variant, sx, ...rest } = props;

        switch (variant) {
            case "h1":
                return <h1 id={id} className={className} style={sx} {...rest}>{children}</h1>;
            case "h2":
                return <h2 id={id} className={className} style={sx} {...rest}>{children}</h2>;
            case "h3":
                return <h3 id={id} className={className} style={sx} {...rest}>{children}</h3>;
            case "h4":
                return <h4 id={id} className={className} style={sx} {...rest}>{children}</h4>;
            case "h5":
                return <h5 id={id} className={className} style={sx} {...rest}>{children}</h5>;
            case "h6":
                return <h6 id={id} className={className} style={sx} {...rest}>{children}</h6>;
            case "subtitle1":
                return <Subtitle1 id={id} className={className} style={sx} {...rest}>{children}</Subtitle1>;
            case "subtitle2":
                return <Subtitle2 id={id} className={className} style={sx} {...rest}>{children}</Subtitle2>;
            case "body1":
                return <Body1 id={id} className={className} style={sx} {...rest}>{children}</Body1>;
            case "body2":
                return <Body2 id={id} className={className} style={sx} {...rest}>{children}</Body2>;
            case "body3":
                return <Body3 id={id} className={className} style={sx} {...rest}>{children}</Body3>;
            case "button":
                return <Button id={id} className={className} style={sx} {...rest}>{children}</Button>;
            case "caption":
                return <Caption id={id} className={className} style={sx} {...rest}>{children}</Caption>;
            case "overline":
                return <Overline id={id} className={className} style={sx} {...rest}>{children}</Overline>;
            default:
                return <p id={id} className={className} style={sx} {...rest}>{children}</p>;
        }
    };

