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
// tslint:disable: jsx-no-multiline-js
import * as React from "react";

export const NETSUITE_LOGO_WIDTH = 44;
export const NETSUITE_LOGO_HEIGHT = 42.09;

export function NetsuiteLogo(props: { cx?: number, cy?: number, scale?: number }) {
    const { cx, cy, scale } = props;
    return (
        <svg transform={scale ? `scale(${scale})` : ''} x={!cx ? 0 : cx - (NETSUITE_LOGO_WIDTH / 2)} y={!cy ? 0 : cy - (NETSUITE_LOGO_HEIGHT / 2)} width={NETSUITE_LOGO_WIDTH} height={NETSUITE_LOGO_HEIGHT} >
            <g id="Symbols" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <g id="Netsuite" transform="translate(-2.000000, -3.000000)">
                    <g id="NetsuitePath" transform="translate(2.000000, 3.000000)">
                        <path d="M10.2200974,11.4782609 C10.2200974,18.3233416 10.2200974,25.2489527 10.2200974,32.06719 C11.5358109,32.06719 12.980516,32.06719 14.3478261,32.06719 C14.3478261,34.7783788 14.3478261,37.4627242 14.3478261,40.173913 C10.1942991,40.173913 6.06657045,40.173913 1.91304348,40.173913 C1.91304348,30.6176435 1.91304348,21.0345304 1.91304348,11.4782609 C4.67346202,11.4782609 7.43388057,11.4782609 10.2200974,11.4782609 Z" id="Path" fill="#B9C7D4" />
                        <path d="M0.0269573668,0 C9.24637681,0 18.5466684,0 27.7391304,0 C27.7391304,7.89863298 27.7391304,16.0144105 27.7391304,23.9130435 C16.9292263,10.1243646 27.7391304,23.9130435 16.9292263,10.1243646 C11.2951367,10.1243646 5.63408966,10.1243646 0,10.1243646 C0.0269573668,6.8400533 0.0269573668,0.162858412 0.0269573668,0 Z" id="Path" fill="#00467F" />
                        <path d="M16.2608696,19.1304348 C19.8872534,23.4593789 23.3512619,27.9457391 26.9235207,32.3009193 C32.6066596,32.3009193 38.3168611,32.3009193 44,32.3009193 C44,35.5541863 44,38.8336894 44,42.0869565 C34.7446023,42.0869565 25.5162672,42.0869565 16.2608696,42.0869565 C16.2608696,34.4260373 16.2608696,26.791354 16.2608696,19.1304348 Z" id="Path" fill="#00467F" />
                        <path d="M28.6956522,9.85870582 C28.6956522,7.17436043 28.6956522,4.59738886 28.6956522,1.91304348 C32.849126,1.91304348 37.0025997,1.91304348 41.1304348,1.91304348 C41.1304348,11.4693131 41.1304348,21.0524261 41.1304348,30.6086957 C38.387091,30.6086957 35.6181085,30.6086957 32.8747647,30.6086957 C32.8747647,23.709928 32.8747647,16.73063 32.8747647,9.85870582 C31.4902734,9.85870582 28.7212909,9.85870582 28.6956522,9.85870582 Z" id="Path" fill="#B9C7D4" />
                    </g>
                </g>
            </g>
        </svg>
    )
}

