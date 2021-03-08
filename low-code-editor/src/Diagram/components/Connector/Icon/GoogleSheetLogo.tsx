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

export const GOOGLE_SHEET_LOGO_WIDTH = 34.768;
export const GOOGLE_SHEET_LOGO_HEIGHT = 48;

export function GoogleSheetLogo(props: { cx?: number, cy?: number, scale?: number }) {
    const { cx, cy, scale } = props;
    return (
        <svg transform={scale ? `scale(${scale})` : ''} x={!cx ? 0 : cx - (GOOGLE_SHEET_LOGO_WIDTH / 2)} y={!cy ? 0 : cy - (GOOGLE_SHEET_LOGO_HEIGHT / 2)} width={GOOGLE_SHEET_LOGO_WIDTH} height={GOOGLE_SHEET_LOGO_HEIGHT} >
            <g id="GoogleSheet">
                <path id="Path" d="M34.764,13.147V44.909A3.094,3.094,0,0,1,31.68,48H3.091A3.092,3.092,0,0,1,0,44.909H0V3.091A3.092,3.092,0,0,1,3.091,0H21.617Z" fill="#28b446" />
                <path id="Path-2" d="M9.675,6.3,21.1,11V6.586L14.621,4.674Z" transform="translate(13.667 6.562)" fill="#219b38" />
                <path id="Path-3" d="M22.142,13.227H12.026a3.111,3.111,0,0,1-3.111-3.111h0V0Z" transform="translate(12.623)" fill="#6ace7c" />
                <path id="Path_1" d="M4.616,25.187A1.006,1.006,0,0,1,3.6,24.192V10.871a1.006,1.006,0,0,1,1.014-.993H20.243a1,1,0,0,1,1.014.993h0V24.187a1,1,0,0,1-1.011.995H4.616Zm6.8-13.312H5.569V14.29h5.852Zm7.867,0H13.436V14.29h5.852ZM11.421,16.32H5.569v2.415h5.852Zm7.867,0H13.436v2.415h5.852Zm-7.867,4.445H5.569v2.415h5.852Zm7.867,0H13.436v2.415h5.852Z" transform="translate(4.951 13.949)" fill="#fff" />Î
            </g>
        </svg>
    )
}
