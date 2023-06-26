/**
 * Copyright (c) 2020, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import * as React from "react";

export const TWITTER_LOGO_WIDTH = 48;
export const TWITTER_LOGO_HEIGHT = 48;

export function TwitterLogo(props: { cx?: number, cy?: number, scale?: number }) {
    const { cx, cy, scale } = props;
    return (
        <svg transform={scale ? `scale(${scale})` : ''} x={!cx ? 0 : cx - (TWITTER_LOGO_WIDTH / 2)} y={!cy ? 0 : cy - (TWITTER_LOGO_HEIGHT / 2)} width={TWITTER_LOGO_WIDTH} height={TWITTER_LOGO_HEIGHT} >
            <g id="twitter" transform="translate(2 2)">
                <g id="Dark_Blue">
                    <path id="Path" d="M22,0h0A22,22,0,0,1,44,22h0A22,22,0,0,1,22,44h0A22,22,0,0,1,0,22H0A22,22,0,0,1,22,0Z" fill="#1da1f2" />
                </g>
                <g id="Logo_FIXED">
                    <path id="Path-2" d="M8.637,22.348c10.375,0,16.056-8.6,16.056-16.056,0-.242,0-.488-.018-.73A11.469,11.469,0,0,0,27.491,2.64a11.208,11.208,0,0,1-3.238.889A5.656,5.656,0,0,0,26.734.409a11.29,11.29,0,0,1-3.582,1.368,5.646,5.646,0,0,0-9.614,5.144A16.027,16.027,0,0,1,1.91,1.025,5.648,5.648,0,0,0,3.656,8.558a5.613,5.613,0,0,1-2.561-.7v.07a5.643,5.643,0,0,0,4.528,5.531,5.665,5.665,0,0,1-2.548.1,5.655,5.655,0,0,0,5.271,3.92,11.3,11.3,0,0,1-7,2.42A10.517,10.517,0,0,1,0,19.809a15.9,15.9,0,0,0,8.637,2.534" transform="translate(8.259 10.828)" fill="#fff" />
                    <path id="Path-3" d="M22,0h0A22,22,0,0,1,44,22h0A22,22,0,0,1,22,44h0A22,22,0,0,1,0,22H0A22,22,0,0,1,22,0Z" fill="none" />
                </g>
            </g>
        </svg>
    )
}
