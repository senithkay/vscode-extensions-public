/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { CSSProperties } from "react";

export function GatewayIcon(props: { styles?: CSSProperties }) {
    return (
        // <svg viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg" style={{ ...props.styles }}>
        //     <path d="M1792 1184v192q0 13-9.5 22.5t-22.5 9.5h-1376v192q0 13-9.5 22.5t-22.5 9.5q-12 0-24-10l-319-320q-9-9-9-22 0-14 9-23l320-320q9-9 23-9 13 0 22.5 9.5t9.5 22.5v192h1376q13 0 22.5 9.5t9.5 22.5zm0-544q0 14-9 23l-320 320q-9 9-23 9-13 0-22.5-9.5t-9.5-22.5v-192h-1376q-13 0-22.5-9.5t-9.5-22.5v-192q0-13 9.5-22.5t22.5-9.5h1376v-192q0-14 9-23t23-9q12 0 24 10l319 319q9 9 9 23z" />
        // </svg>
        <svg viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg" style={{ ...props.styles }}>
            <g fill="none" fill-rule="evenodd" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" transform="translate(3 3)">
                <path d="m6.5 6.5-4 4 4 4" />
                <path d="m14.5 10.5h-12" />
                <path d="m8.5.5 4 4-4 4" />
                <path d="m12.5 4.5h-12" />
            </g>
        </svg>
    );
}
