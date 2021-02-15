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

export const TWILIO_LOGO_WIDTH = 43.88;
export const TWILIO_LOGO_HEIGHT = 43.88;

export function TwilioLogo(props: { cx?: number, cy?: number, scale?: number }) {
    const { cx, cy, scale } = props;
    return (
        <svg transform={scale ? `scale(${scale})` : ''} x={!cx ? 0 : cx - (TWILIO_LOGO_WIDTH / 2)} y={!cy ? 0 : cy - (TWILIO_LOGO_HEIGHT / 2)} width={TWILIO_LOGO_WIDTH} height={TWILIO_LOGO_HEIGHT} >
            <g id="Symbols" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <g id="Logo/Twilio" transform="translate(-2.000000, -2.000000)" fill="#CF272D" fillRule="nonzero">
                    <g id="Twilio-01" transform="translate(2.000000, 2.000000)">
                        <path d="M22,38.157377 C13.0797814,38.157377 5.84262295,30.9202186 5.84262295,22 C5.84262295,13.0797814 13.0797814,5.84262295 22,5.84262295 C30.9202186,5.84262295 38.157377,13.0797814 38.157377,22 C38.157377,30.9202186 30.9202186,38.157377 22,38.157377 Z M22,0.0601092896 C9.88196721,0.0601092896 0.0601092896,9.88196721 0.0601092896,22 C0.0601092896,34.1180328 9.88196721,43.9398907 22,43.9398907 C34.1180328,43.9398907 43.9398907,34.1180328 43.9398907,22 C43.9398907,9.88196721 34.1180328,0.0601092896 22,0.0601092896 Z" id="XMLID_5_" />
                        <path d="M22.9016393,16.5300546 C22.9016393,14.0054645 24.9453552,11.9737705 27.4579235,11.9737705 C29.9825137,11.9737705 32.0142077,14.0174863 32.0142077,16.5300546 C32.0142077,19.0546448 29.9704918,21.0863916 27.4579235,21.0863916 C24.9453552,21.0983607 22.9016393,19.0546448 22.9016393,16.5300546" id="XMLID_6_" />
                        <path d="M22.9016393,27.4699454 C22.9016393,24.9453552 24.9453552,22.9136612 27.4579235,22.9136612 C29.9825137,22.9136612 32.0142077,24.957377 32.0142077,27.4699454 C32.0142077,29.9945355 29.9704918,32.0262295 27.4579235,32.0262295 C24.9453552,32.0262295 22.9016393,29.9825137 22.9016393,27.4699454" id="XMLID_7_" />
                        <path d="M11.9737705,27.4699454 C11.9737705,24.9453552 14.0174863,22.9136612 16.5300546,22.9136612 C19.0546448,22.9136612 21.0863388,24.957377 21.0863388,27.4699454 C21.0863388,29.9945355 19.042623,32.0262295 16.5300546,32.0262295 C14.0174863,32.0262295 11.9737705,29.9825137 11.9737705,27.4699454" id="XMLID_8_" />
                        <path d="M11.9737705,16.5300546 C11.9737705,14.0054645 14.0174863,11.9737705 16.5300546,11.9737705 C19.0546448,11.9737705 21.0863388,14.0174863 21.0863388,16.5300546 C21.0863388,19.042623 19.042623,21.0863916 16.5300546,21.0863916 C14.0174863,21.0983607 11.9737705,19.0546448 11.9737705,16.5300546" id="XMLID_9_" />
                    </g>
                </g>
            </g>
        </svg>
    )
}

