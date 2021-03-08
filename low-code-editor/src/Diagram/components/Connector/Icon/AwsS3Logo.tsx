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

export const AWSS3_LOGO_WIDTH = 39.61;
export const AWSS3_LOGO_HEIGHT = 47.87;

export function AwsS3Logo(props: { cx?: number, cy?: number, scale?: number }) {
    const { cx, cy, scale } = props;
    return (
        <svg transform={scale ? `scale(${scale})` : ''} x={!cx ? 0 : cx - (AWSS3_LOGO_WIDTH / 2)} y={!cy ? 0 : cy - (AWSS3_LOGO_HEIGHT / 2)} width={AWSS3_LOGO_WIDTH} height={AWSS3_LOGO_HEIGHT} >
            <g id="AWSS3_logo" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <g id="AWSS3" transform="translate(-4.000000, 0.000000)" fillRule="nonzero">
                    <g id="AWSS3_polyline" transform="translate(4.000000, 0.000000)">
                        <polyline id="XMLID_2_" fill="#8C3123" points="3.18688525 8.36721311 0 9.96721311 0 37.9672131 3.18688525 39.5540984 3.21311475 39.5278689 3.21311475 8.39344262 3.18688525 8.36721311" />
                        <polyline id="XMLID_3_" fill="#E05243" points="20.2622951 35.4885246 3.18688525 39.5540984 3.18688525 8.36721311 20.2622951 12.3409836 20.2622951 35.4885246" />
                        <polyline id="XMLID_4_" fill="#8C3123" points="12.5639344 29.1278689 19.8032787 30.0459016 19.842623 29.9409836 19.895082 18.0721311 19.8032787 17.9803279 12.5639344 18.8852459 12.5639344 29.1278689" />
                        <polyline id="XMLID_5_" fill="#8C3123" points="19.8032787 35.5409836 36.4065574 39.5672131 36.4327869 39.5278689 36.4327869 8.39344262 36.4065574 8.36721311 19.8032787 12.3934426 19.8032787 35.5409836" />
                        <polyline id="XMLID_6_" fill="#E05243" points="27.042623 29.1278689 19.8032787 30.0459016 19.8032787 17.9803279 27.042623 18.8852459 27.042623 29.1278689" />
                        <polyline id="XMLID_7_" fill="#5E1F18" points="27.042623 13.9278689 19.8032787 15.252459 12.5639344 13.9278689 19.7901639 12.0393443 27.042623 13.9278689" />
                        <polyline id="XMLID_8_" fill="#F2B0A9" points="27.042623 34.0721311 19.8032787 32.7344262 12.5639344 34.0721311 19.7901639 36.0918033 27.042623 34.0721311" />
                        <polyline id="XMLID_9_" fill="#8C3123" points="12.5639344 13.9278689 19.8032787 12.1442623 19.8557377 12.1180328 19.8557377 0.118032787 19.8032787 0.0655737705 12.5639344 3.6852459 12.5639344 13.9278689" />
                        <polyline id="XMLID_10_" fill="#E05243" points="27.042623 13.9278689 19.8032787 12.1442623 19.8032787 0.0655737705 27.042623 3.6852459 27.042623 13.9278689" />
                        <polyline id="XMLID_11_" fill="#8C3123" points="19.8032787 47.9344262 12.5639344 44.3147541 12.5639344 34.0721311 19.8032787 35.8557377 19.9081967 35.9868852 19.8819672 47.7245902 19.8032787 47.9344262" />
                        <polyline id="XMLID_12_" fill="#E05243" points="19.8032787 47.9344262 27.042623 44.3147541 27.042623 34.0721311 19.8032787 35.8557377 19.8032787 47.9344262" />
                        <polyline id="XMLID_13_" fill="#E05243" points="36.4065574 8.36721311 39.6065574 9.96721311 39.6065574 37.9672131 36.4065574 39.5672131 36.4065574 8.36721311" />
                    </g>
                </g>
            </g>
        </svg>
    )
}
