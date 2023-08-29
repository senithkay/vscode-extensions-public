/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from "react";

interface ComponentLabelProps {
    label: string;
    variant?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export const ComponentLabel: React.FC<ComponentLabelProps> = (props: ComponentLabelProps) => {
    const { label, variant } = props;

    return (
        <>
            {variant === "h1" && <h1>{label}</h1>}
            {variant === "h2" && <h2>{label}</h2>}
            {variant === "h3" && <h3>{label}</h3>}
            {variant === "h4" && <h4>{label}</h4>}
            {variant === "h5" && <h5>{label}</h5>}
            {variant === "h6" && <h6>{label}</h6>}
        </>
    );
};
