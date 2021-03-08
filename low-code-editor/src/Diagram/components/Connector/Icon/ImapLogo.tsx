/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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

export const IMAP_LOGO_WIDTH = 48;
export const IMAP_LOGO_HEIGHT = 48;

export function ImapLogo(props: { cx?: number, cy?: number, scale?: number }) {
    const { cx, cy, scale } = props;
    return (
        <svg transform={scale ? `scale(${scale})` : ''} x={!cx ? 0 : cx - (IMAP_LOGO_WIDTH / 2)} y={!cy ? 0 : cy - (IMAP_LOGO_HEIGHT / 2)} width={IMAP_LOGO_WIDTH} height={IMAP_LOGO_HEIGHT} >
            <g id="ImapWrapper" transform="translate(-23.35 9.009)">
                <path id="Shape" d="M68.938,35.491h-44" fill="none" stroke="#ccd1f2" strokeLinecap="round" strokeMiterlimit="10" strokeWidth="3.175" />
                <path id="Combined_Shape" d="M46.938,10.636a2.473,2.473,0,0,1-1.48-.485L25.511-4.494a2.5,2.5,0,0,1-.535-3.494A2.5,2.5,0,0,1,26.99-9.009h39.9a2.5,2.5,0,0,1,2.5,2.5,2.5,2.5,0,0,1-1.02,2.015L48.417,10.15A2.477,2.477,0,0,1,46.938,10.636ZM28.515-6.009,46.938,7.515,65.36-6.009Z" fill="#ccd1f2" />
                <path id="Path_2" d="M53.08,17.19H49.5l-4.25,11.5h2.81l.81-2.2h4.86l.8,2.2h2.81Zm-3.33,6.94,1.56-4.31,1.56,4.31Zm-8.412,4.561V21.955l-3.38,4.619L34.59,21.955v6.736H31.863v-11.5h2.59L37.974,22.3l3.5-5.108h2.6v11.5Zm-14.4,0v-11.5H29.7v11.5Zm40.1-10.417A3.8,3.8,0,0,0,64.076,17l.01-.01h-5.48v11.53h2.67V25.3h2.7a3.908,3.908,0,0,0,3.05-1.27A4.218,4.218,0,0,0,67.036,18.274Zm-1.95,3.936a1.489,1.489,0,0,1-1.17.5l-.01.01h-2.64V19.34h2.75a1.411,1.411,0,0,1,1.1.5,1.73,1.73,0,0,1,.43,1.19A1.645,1.645,0,0,1,65.086,22.21Z" fill="#5567d5" />
            </g>
        </svg>
    )
}
