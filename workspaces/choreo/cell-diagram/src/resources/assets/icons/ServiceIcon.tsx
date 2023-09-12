/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { CSSProperties } from "react";

export function ServiceIcon(props: { styles?: CSSProperties }) {
    return (
        <svg viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg" style={{ ...props.styles }}>
            <path d="M1151 960h316q-1-3-2.5-8t-2.5-8l-212-496h-708l-212 496q-1 2-2.5 8t-2.5 8h316l95 192h320zm513 30v482q0 26-19 45t-45 19h-1408q-26 0-45-19t-19-45v-482q0-62 25-123l238-552q10-25 36.5-42t52.5-17h832q26 0 52.5 17t36.5 42l238 552q25 61 25 123z" />
        </svg>
    );
}
