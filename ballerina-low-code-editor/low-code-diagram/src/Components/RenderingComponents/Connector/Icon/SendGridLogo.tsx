/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
import * as React from "react";

export const LOGO_WIDTH = 20;
export const LOGO_HEIGHT = 20;

export function SendGridLogo(props: { cx?: number, cy?: number, scale?: number; }) {
    const { cx, cy, scale } = props;
    return (
        <svg transform={scale ? `scale(${scale})` : ''} x={!cx ? 0 : cx - (LOGO_WIDTH / 2)} y={!cy ? 0 : cy - (LOGO_HEIGHT / 2)} width={LOGO_WIDTH} height={LOGO_HEIGHT} >
            <title>C728B5A1-E8B9-4D2C-912E-4D4EC818DA55</title>
            <g id="Adding" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <g id="adding-new-API-Calls" transform="translate(-1008.000000, -714.000000)" fillRule="nonzero">
                    <g id="Group" transform="translate(1008.000000, 714.000000)">
                        <rect id="Rectangle" fill="#99E1F4" x="6.66142969" y="13.3385703" width="6.66142969" height="6.66142969"/>
                        <polygon id="Path" fill="#99E1F4" points="6.66142969 6.67714061 6.66142969 6.67714061 6.66142969 6.67714061 0 6.67714061 0 13.3385703 6.66142969 13.3385703"/>
                        <rect id="Rectangle" fill="#1A82E2" x="0" y="13.3385703" width="6.66142969" height="6.66142969"/>
                        <polygon id="Path" fill="#00B2E3" points="20 6.67714061 20 6.67714061 13.3385703 6.67714061 13.3385703 13.3385703 20 13.3385703"/>
                        <rect id="Rectangle" fill="#00B2E3" x="6.66142969" y="0" width="6.66142969" height="6.66142969"/>
                        <polygon id="Path" fill="#009DD9" points="6.66142969 6.67714061 6.66142969 13.3385703 13.3385703 13.3385703 13.3385703 6.67714061 13.3385703 6.67714061"/>
                        <rect id="Rectangle" fill="#1A82E2" x="13.3385703" y="0" width="6.66142969" height="6.66142969"/>
                    </g>
                </g>
            </g>
        </svg>
    );
}
