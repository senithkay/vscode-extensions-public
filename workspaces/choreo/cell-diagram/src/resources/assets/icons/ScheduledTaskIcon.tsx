/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { CSSProperties } from "react";

export function ScheduledTaskIcon(props: { styles?: CSSProperties }) {
    return (
        <svg viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg" style={{ ...props.styles }}>
            <g fill="none" fill-rule="evenodd" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" transform="matrix(-1 0 0 1 19 2)">
                <circle cx="8.5" cy="8.5" r="8" />
                <path d="m8.5 5.5v4h-3.5" />
            </g>
        </svg>
    );
}
