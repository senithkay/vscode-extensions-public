/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import * as React from "react";

import { useStyles } from "./style";

export interface OverlayBackgroundProps {
    confirmationOverlay?: boolean;
}

export function OverlayBackground(props: OverlayBackgroundProps) {
    const classes = useStyles();
    const overlayClassName = props.confirmationOverlay ? classes.confirmationOverlayBackground : classes.overlayBackground;
    return (
        <svg
            height={'1000vh'}
            width={'1000vw'}
            className={overlayClassName}
        />
    );
}
