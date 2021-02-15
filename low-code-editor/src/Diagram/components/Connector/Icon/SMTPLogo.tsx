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

export const SMTP_LOGO_WIDTH = 48;
export const SMTP_LOGO_HEIGHT = 48;

export function SMTPLogo(props: { cx?: number, cy?: number, scale?: number }) {
    const { cx, cy, scale } = props;
    return (
        <svg transform={scale ? `scale(${scale})` : ''} x={!cx ? 0 : cx - (SMTP_LOGO_WIDTH / 2)} y={!cy ? 0 : cy - (SMTP_LOGO_HEIGHT / 2)} width={SMTP_LOGO_WIDTH} height={SMTP_LOGO_HEIGHT} >
            <g id="SmtpLogo" transform="translate(-78.385 7.521)">
                <path id="Shape" d="M123.972,36.979h-44" fill="none" stroke="#ccd1f2" strokeLinecap="round" strokeMiterlimit="10" strokeWidth="3.175" />
                <path id="Combined_Shape" d="M101.972,12.124a2.475,2.475,0,0,1-1.48-.485L80.545-3.006A2.5,2.5,0,0,1,80.01-6.5a2.5,2.5,0,0,1,2.014-1.021h39.9a2.5,2.5,0,0,1,2.5,2.5A2.5,2.5,0,0,1,123.4-3.006L103.451,11.638A2.475,2.475,0,0,1,101.972,12.124ZM83.549-4.521,101.972,9,120.394-4.521Z" fill="#ccd1f2" />
                <path id="Path_1" d="M81.9,30.466a5.279,5.279,0,0,1-1.931-2.487l2.576-.8a3.016,3.016,0,0,0,1.105,1.383,3.129,3.129,0,0,0,1.836.53,2.283,2.283,0,0,0,1.283-.321.931.931,0,0,0,.5-.773c0-.474-.405-.843-1.224-1.109l-2.936-.916A4.188,4.188,0,0,1,81.2,24.8a2.67,2.67,0,0,1-.7-1.881,3.027,3.027,0,0,1,1.193-2.44,4.586,4.586,0,0,1,3.029-1,5.822,5.822,0,0,1,3.188.876A4.353,4.353,0,0,1,89.766,22.5l-2.489.74a2.627,2.627,0,0,0-1.025-1,2.992,2.992,0,0,0-1.5-.386,2.036,2.036,0,0,0-1.1.266.781.781,0,0,0-.414.675q0,.591.763.82l2.87.924a6.415,6.415,0,0,1,2.3,1.182,2.581,2.581,0,0,1,.811,2.049,3.218,3.218,0,0,1-1.3,2.613A5.212,5.212,0,0,1,85.3,31.429l.018.05A5.644,5.644,0,0,1,81.9,30.466Zm25.462.732V22.147h-3.624V19.672h9.96v2.475h-3.629V31.2Zm-7.035,0V24.446l-3.358,4.633-3.339-4.63V31.2h-2.7V19.672H93.5l3.49,5.12,3.466-5.12h2.576V31.2ZM122.84,20.95a3.8,3.8,0,0,0-2.96-1.27l.01-.01h-5.48V31.2h2.67V27.98h2.7a3.908,3.908,0,0,0,3.05-1.27A4.218,4.218,0,0,0,122.84,20.95Zm-1.95,4.27a1.489,1.489,0,0,1-1.17.5l-.01.01h-2.64V22.35h2.75a1.411,1.411,0,0,1,1.1.5,1.73,1.73,0,0,1,.43,1.19A1.645,1.645,0,0,1,120.89,25.22Z" fill="#5567d5" />
            </g>
        </svg>
    )
}
