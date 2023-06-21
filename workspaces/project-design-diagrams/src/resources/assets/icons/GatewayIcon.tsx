/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React from "react";

const ICON_COLOR = "#5567D5";
const BG_COLOR = "#FFF";

export function GatewayIcon() {
    return (
        <svg width="60" height="60" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.5" y="31.5" width="31" height="31" rx="15.5" transform="rotate(-90 0.5 31.5)" fill={BG_COLOR}/>
            <path d="M21 20L9 20M9 20L12.4452 23.5M9 20L12.4452 16.5M11 12L23 12M23 12L19.5548 8.5M23 12L19.5548 15.5" stroke={ICON_COLOR} strokeLinecap="round"/>
            <rect x="0.5" y="31.5" width="31" height="31" rx="15.5" transform="rotate(-90 0.5 31.5)" stroke={ICON_COLOR}/>
        </svg>
    );
}
