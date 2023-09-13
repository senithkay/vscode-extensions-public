/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { CSSProperties } from "react";

export function DatabaseIcon(props: { styles?: CSSProperties }) {
    return (
        <svg fill="none" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg" style={{ ...props.styles }}>
            <g fill="none" fill-rule="evenodd" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" transform="translate(4 2)">
                <path d="m.5 3.20588235c0-1.29949353 2.5-2.74110534 6-2.70588235s6 1.55344765 6 2.85294118v10.29411762c0 1.2994936-2.5 2.8529412-6 2.8529412s-6-1.7005065-6-3c0-.6412832 0-9.65283449 0-10.29411765z" />
                <path d="m.5 3.5c0 1.38071187 2 3 6 3s6-1.63689962 6-3.0176115m-12 5.0176115c0 1.38071187 2 3 6 3s6-1.63689962 6-3.0176115" />
            </g>
        </svg>
    );
}
