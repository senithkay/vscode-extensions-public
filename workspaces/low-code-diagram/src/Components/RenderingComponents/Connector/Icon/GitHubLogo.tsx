/**
 * Copyright (c) 2020, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import * as React from "react";

export const GITHUB_LOGO_WIDTH = 20;
export const GITHUB_LOGO_HEIGHT = 20;

export function GitHubLogo(props: { cx?: number, cy?: number, scale?: number }) {
    const { cx, cy, scale } = props;
    return (
        <svg transform={scale ? `scale(${scale})` : ''} x={!cx ? 0 : cx - (GITHUB_LOGO_WIDTH / 2)} y={!cy ? 0 : cy - (GITHUB_LOGO_HEIGHT / 2)} width={GITHUB_LOGO_WIDTH} height={GITHUB_LOGO_HEIGHT} >
            <g id="GithubWrapper">
                <path id="Fill_4" d="M10,0A10.129,10.129,0,0,0,0,10.253a10.235,10.235,0,0,0,6.839,9.728c.5.094.683-.222.683-.494,0-.243-.009-.888-.014-1.744-2.782.619-3.368-1.375-3.368-1.375a2.7,2.7,0,0,0-1.111-1.5c-.908-.636.069-.623.069-.623A2.106,2.106,0,0,1,4.629,15.3a2.1,2.1,0,0,0,2.91.852,2.213,2.213,0,0,1,.635-1.37c-2.22-.259-4.555-1.139-4.555-5.068A4.019,4.019,0,0,1,4.649,6.966a3.77,3.77,0,0,1,.1-2.713S5.586,3.977,7.5,5.3a9.241,9.241,0,0,1,5.007,0c1.909-1.327,2.747-1.051,2.747-1.051a3.771,3.771,0,0,1,.1,2.713,4.012,4.012,0,0,1,1.028,2.751c0,3.939-2.338,4.806-4.566,5.059a2.483,2.483,0,0,1,.678,1.9c0,1.37-.012,2.476-.012,2.812,0,.274.18.594.688.493A10.237,10.237,0,0,0,20,10.253,10.13,10.13,0,0,0,10,0" fill="#161514"/>
            </g>
        </svg>
    )
}

