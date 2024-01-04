/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { ReactNode } from "react";

interface TypographyProps {
    id?: string;
    className?: string;
    children: ReactNode;
    variant?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
    sx?: any;
}

export const Typography: React.FC<TypographyProps> = (props: TypographyProps) => {
    const { id, className, children, variant, sx } = props;

    return (
        <div id={id} className={className}>
            {variant === "h1" && <h1 style={sx}>{children}</h1>}
            {variant === "h2" && <h2 style={sx}>{children}</h2>}
            {variant === "h3" && <h3 style={sx}>{children}</h3>}
            {variant === "h4" && <h4 style={sx}>{children}</h4>}
            {variant === "h5" && <h5 style={sx}>{children}</h5>}
            {variant === "h6" && <h6 style={sx}>{children}</h6>}
        </div>
    );
};
