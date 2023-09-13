/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { CSSProperties } from "react";

export function WebAppIcon(props: { styles?: CSSProperties }) {
    return (
        <svg viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg" style={{ ...props.styles }}>
            <g fill="none" fill-rule="evenodd" transform="translate(2 2)">
                <path
                    d="m2.5.5h12.0269119c1.1045695 0 2 .8954305 2 2v11.9907459c0 1.0543618-.8158778 1.9181651-1.8507376 1.9945143l-.1588615.0054627-12.02691193-.0577246c-1.10080997-.0052835-1.99040087-.8991544-1.99040087-1.999977v-11.9330213c0-1.1045695.8954305-2 2-2z"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
                <path d="m.5 4.5h16.027" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                <circle cx="12.5" cy="12.5" fill="currentColor" r="1" />
            </g>
        </svg>
    );
}
