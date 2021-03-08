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

export const GOOGLE_CALANDER_LOGO_WIDTH = 48;
export const GOOGLE_CALANDER_LOGO_HEIGHT = 45.965;

export function GoogleCalanderLogo(props: { cx?: number, cy?: number, scale?: number }) {
    const { cx, cy, scale } = props;
    return (
        <svg transform={scale ? `scale(${scale})` : ''} x={!cx ? 0 : cx - (GOOGLE_CALANDER_LOGO_WIDTH / 2)} y={!cy ? 0 : cy - (GOOGLE_CALANDER_LOGO_HEIGHT / 2)} width={GOOGLE_CALANDER_LOGO_WIDTH} height={GOOGLE_CALANDER_LOGO_HEIGHT} >
            <g id="GoogleCalander" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <g id="_015-calendar" transform="translate(0 -0.033)">
                    <path id="Shape" d="M1.322,9.272v-7.1A2.122,2.122,0,0,1,3.428.033H40.8a2.122,2.122,0,0,1,2.108,2.136v7.1Z" transform="translate(1.887)" fill="#e6e6e6" />
                    <path id="Path" d="M47.954,5.8,44.76,22.427l1.306,17.29a2.188,2.188,0,0,1-2.018,2.345c-.058,0-.113.007-.168.007H4.121A2.192,2.192,0,0,1,1.927,39.88c0-.055,0-.11.007-.163L3.24,22.427.046,5.8a2.54,2.54,0,0,1,2.016-2.97,2.487,2.487,0,0,1,.48-.046H45.456A2.539,2.539,0,0,1,48,5.319,2.5,2.5,0,0,1,47.954,5.8Z" transform="translate(0 3.929)" fill="#3a5bbc" />
                    <path id="Path-2" d="M42.716,30.891H3A2.207,2.207,0,0,1,.8,28.679c0-.058,0-.117.007-.172L2.12,10.985H43.6l1.3,17.522a2.207,2.207,0,0,1-2.016,2.377C42.828,30.888,42.773,30.891,42.716,30.891Z" transform="translate(1.144 15.107)" fill="#518ef8" />
                    <g id="Group" transform="translate(10.941 15.136)">
                        <path id="Path-3" d="M16.879,12.682a6.069,6.069,0,0,0-6.137-5.964,6.07,6.07,0,0,0-6.134,5.964H6.652a4.012,4.012,0,0,1,4.09-3.92,4.014,4.014,0,0,1,4.093,3.92,4.014,4.014,0,0,1-4.093,3.92H8.834v2.046h1.908a3.923,3.923,0,1,1,0,7.839,4.012,4.012,0,0,1-4.09-3.92H4.608a6.069,6.069,0,0,0,6.134,5.967,6.069,6.069,0,0,0,6.137-5.967,5.922,5.922,0,0,0-2.7-4.942A5.922,5.922,0,0,0,16.879,12.682Z" transform="translate(-4.608 -5.936)" fill="#fff" />
                        <path id="Path-4" d="M11.3,10.66l1.049,1.755,4.042-2.428V27.952h2.046V6.395Z" transform="translate(4.945 -6.395)" fill="#fff" />
                    </g>
                </g>
            </g>
        </svg>
    )
}

