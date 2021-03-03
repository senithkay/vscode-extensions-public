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

export const AWSSQS_LOGO_WIDTH = 39.66;
export const AWSSQS_LOGO_HEIGHT = 47.87;

export function AwsSQSLogoprops(props: { cx?: number, cy?: number, scale?: number }) {
    const { cx, cy, scale } = props;
    return (
        <svg transform={scale ? `scale(${scale})` : ''} x={!cx ? 0 : cx - (AWSSQS_LOGO_WIDTH / 2)} y={!cy ? 0 : cy - (AWSSQS_LOGO_HEIGHT / 2)} width={AWSSQS_LOGO_WIDTH} height={AWSSQS_LOGO_HEIGHT}>
            <g id="AWSSQS_wrapper" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <g id="AWSSQS" transform="translate(-4.000000, 0.000000)" fillRule="nonzero">
                    <g id="AWSSQS_polyline" transform="translate(4.000000, 0.000000)">
                        <polyline id="XMLID_2_" fill="#D9A741" points="39.7639344 15.5934426 39.1213115 15.5803279 19.947541 9.90163934 19.9344262 9.63934426 19.9344262 0.0655737705 39.7639344 9.98032787 39.7639344 15.5934426" />
                        <polyline id="XMLID_3_" fill="#876929" points="19.9344262 10.2163934 19.9344262 0.0655737705 0.104918033 9.98032787 0.104918033 38.0196721 0.118032787 38.0196721 0.118032787 38.0196721 19.9344262 47.9344262 20 47.842623 19.9737705 38.4131148 19.9344262 38.3606557 18.7016393 37.4819672 3.35737705 32.904918 3.43606557 15.1737705 19.9344262 10.2163934" />
                        <polyline id="XMLID_4_" fill="#D9A741" points="22.8983607 30.3213115 2.63606557 33.1672131 2.63606557 14.8196721 22.8983607 17.6786885 22.8983607 30.3213115" />
                        <polyline id="XMLID_5_" fill="#876929" points="12.6295082 29.1540984 19.9344262 30.0852459 19.9344262 17.9016393 12.6295082 18.8327869 12.6295082 29.1540984" />
                        <polyline id="XMLID_6_" fill="#876929" points="5.27213115 28.2229508 10.0196721 28.8262295 10.0196721 19.1606557 5.27213115 19.7639344 5.27213115 28.2229508" />
                        <polyline id="XMLID_7_" fill="#624A1E" points="2.63606557 14.8196721 19.9344262 9.63934426 39.7639344 15.5934426 22.9114754 17.6786885 2.63606557 14.8196721" />
                        <polyline id="XMLID_8_" fill="#D9A741" points="39.7508197 27.5409836 19.9344262 30.0459016 19.9344262 17.9016393 39.7508197 20.4327869 39.7508197 27.5409836" />
                        <polyline id="XMLID_9_" fill="#D9A741" points="39.7508197 32.4196721 39.3180328 32.4327869 20 38.2819672 19.9344262 38.3606557 19.9344262 47.9344262 39.7508197 38.0327869 39.7508197 32.4196721" />
                        <polyline id="XMLID_10_" fill="#FAD791" points="2.63606557 33.1672131 19.9344262 38.3606557 39.7508197 32.4196721 22.8983607 30.3213115 2.63606557 33.1672131" />
                    </g>
                </g>
            </g>
        </svg>
    )
}
