/**
 * Copyright (c) 2020, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
// tslint:disable: jsx-no-multiline-js
import * as React from "react";

export const JIRA_LOGO_WIDTH = 36;
export const JIRA_LOGO_HEIGHT = 48;

export function jiraLogo(props: { cx?: number, cy?: number, scale?: number }) {
    const { cx, cy, scale } = props;
    return (
        <svg transform={scale ? `scale(${scale})` : ''} x={!cx ? 0 : cx - (JIRA_LOGO_WIDTH / 2)} y={!cy ? 0 : cy - (JIRA_LOGO_HEIGHT / 2)} width={JIRA_LOGO_WIDTH} height={JIRA_LOGO_HEIGHT} >
            <g id="JiraWrapper" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <g id="Jira" transform="translate(-6.000000, 0.000000)" fill="#003366" fillRule="nonzero">
                    <g id="JiraLogo" transform="translate(6.000000, 0.000000)">
                        <path d="M25.5737967,30.3600768 C36.3485283,19.6702834 35.9986993,12.1203962 35.9986993,12.1203962 C35.9986993,10.3211241 34.459452,11.3089598 34.459452,11.3089598 C31.5908546,13.6374296 27.462873,13.7079893 27.462873,13.7079893 C26.2734546,18.8941267 19.7666362,25.3503386 18.1224401,26.9026519 C17.0029875,25.8795363 9.79651119,19.070526 8.53712698,13.5668699 C8.53712698,13.5668699 4.40914541,13.5668699 1.54054804,11.2384001 C1.54054804,11.2384001 0.00130067277,10.3211241 0.00130067277,12.0851164 L0.00130067277,12.0851164 C0.00130067277,12.0851164 -0.348528274,19.3880446 10.4262033,30.0425582 C21.2009349,40.7323516 22.4253362,45.1776123 21.830627,48 L29.6667954,48 C29.6667954,48 30.121573,39.8150756 23.7197033,32.0535094 C24.3493954,31.5595916 24.9441046,30.995114 25.5737967,30.3600768 Z" id="XMLID_19_" />
                        <path d="M16,40.2640587 C14.644966,38.5183374 12.8495461,36.4303178 10.4782366,34 C5.63399027,41.0513447 6.00662461,48 6.00662461,48 L13.5948147,48 C13.2899321,46.1858191 13.5609389,43.9266504 16,40.2640587" id="XMLID_20_" />
                        <path d="M13.572677,14.0042531 L21.2060539,14.0042531 C21.2060539,14.0042531 22.2032068,13.8636351 21.9625147,15.1995063 C21.6186689,17.1330042 17.4925192,21 17.4925192,21 C17.4925192,21 14.4666761,18.1524849 13.1256774,15.4455879 C13.160062,15.4807424 12.6099087,14.0042531 13.572677,14.0042531" id="XMLID_21_" />
                        <path d="M31,6.5 C31,8.44845361 29.4484536,10 27.5,10 C25.5515464,10 24,8.44845361 24,6.5 C24,4.55154639 25.5515464,3 27.5,3 C29.4123711,3 31,4.58762887 31,6.5" id="XMLID_22_" />
                        <path d="M11,6.5 C11,8.44845361 9.44845361,10 7.5,10 C5.55154639,10 4,8.44845361 4,6.5 C4,4.55154639 5.55154639,3 7.5,3 C9.44845361,3 11,4.58762887 11,6.5" id="XMLID_23_" />
                        <path d="M22,3.5 C22,5.44845361 20.4484536,7 18.5,7 C16.5515464,7 15,5.44845361 15,3.5 C15,1.55154639 16.5515464,0 18.5,0 C20.4484536,0 22,1.55154639 22,3.5" id="XMLID_24_" />
                    </g>
                </g>
            </g>
        </svg>
    )
}

