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

import {TooltipCodeSnippet} from "../../../components/Tooltip";

export const FOREACH_SVG_WIDTH_WITH_SHADOW = 113.824;
export const FOREACH_SVG_HEIGHT_WITH_SHADOW = 113.822;
export const FOREACH_SVG_WIDTH = 96.2;
export const FOREACH_SVG_HEIGHT = 96.2;
export const FOREACH_SHADOW_OFFSET = FOREACH_SVG_HEIGHT_WITH_SHADOW - FOREACH_SVG_HEIGHT;

export function ForeachSVG(props: { x: number, y: number, text: string, codeSnippet: string, openInCodeView?: () => void }) {
    const { text, codeSnippet, openInCodeView, ...xyProps } = props;
    return (
        <svg {...xyProps} width={FOREACH_SVG_WIDTH_WITH_SHADOW} height={FOREACH_SVG_HEIGHT_WITH_SHADOW}>
            <defs>
                <linearGradient id="ForeachLinearGradient" x1="0.5" x2="0.5" y2="1" gradientUnits="objectBoundingBox">
                    <stop offset="0" stopColor="#fcfcfd" />
                    <stop offset="1" stopColor="#f7f8fb" />
                </linearGradient>
                <filter id="ForeachFilterDefault" x="-20" y="-20" width="113.824" height="113.822" filterUnits="userSpaceOnUse">
                    <feOffset dy="1" in="SourceAlpha" />
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feFlood floodColor="#a9acb6" floodOpacity="0.388" />
                    <feComposite operator="in" in2="blur" />
                    <feComposite in="SourceGraphic" />
                </filter>
                <filter id="ForeachFilterHover" x="-20" y="-20" width="146.824" height="146.822" filterUnits="userSpaceOnUse">
                    <feOffset dy="1" in="SourceAlpha" />
                    <feGaussianBlur stdDeviation="7.5" result="blur" />
                    <feFlood floodColor="#a9acb6" floodOpacity="0.388" />
                    <feComposite operator="in" in2="blur" />
                    <feComposite in="SourceGraphic" />
                </filter>
            </defs>
            <TooltipCodeSnippet openInCodeView={openInCodeView} content={codeSnippet} placement="right" arrow={true}>
                <g id="Foreach" className="foreach-group" transform="translate(56.912 6.414) rotate(45)">
                    <g transform="matrix(0.71, -0.71, 0.71, 0.71, -44.78, 35.71)" >
                        <g id="ForeachPolygon" transform="translate(56.91 6.41) rotate(45)">
                            <rect width="71" height="71" rx="6.5" stroke="none" />
                            <rect x="0" y="0" width="71" height="71" rx="6.5" fill="none" className="click-effect" />
                        </g>
                    </g>
                    <g id="Develop" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                        <g id="develop-UI-kit" transform="translate(-614, -2681)" fill-rule="nonzero">
                            <g id="Logo/Plus/For-each" transform="translate(618.000000, 2696.000000) rotate(-45)">
                                <path d="M6,3 C6.55228475,3 7,3.44771525 7,4 C7,4.51283584 6.61395981,4.93550716 6.11662113,4.99327227 L6,5 C3.790861,5 2,6.790861 2,9 C2,11.1421954 3.68396847,12.8910789 5.80035966,12.9951047 L6,13 L7.586,13 L6.29053955,11.7047531 C5.93005559,11.3442692 5.90232605,10.7770381 6.20735094,10.3847469 L6.29053955,10.2905396 C6.65102351,9.93005559 7.21825457,9.90232605 7.61054578,10.2073509 L7.70475311,10.2905396 L10.6985438,13.284432 C10.7042862,13.2900387 10.7099613,13.2957138 10.715568,13.3014562 L11.4142136,14 L7.70475311,17.7094604 C7.31422882,18.0999847 6.68106384,18.0999847 6.29053955,17.7094604 C5.93005559,17.3489765 5.90232605,16.7817454 6.20735094,16.3894542 L6.29053955,16.2952469 L7.584,15 L6,15 C2.6862915,15 0,12.3137085 0,9 C0,5.76160306 2.56557489,3.12242824 5.77506174,3.00413847 L6,3 Z" id="Combined-Shape" fill="#5567D5" />
                                <path d="M14.5,0 C15.0522847,0 15.5,0.44771525 15.5,1 C15.5,1.51283584 15.1139598,1.93550716 14.6166211,1.99327227 L14.5,2 C12.290861,2 10.5,3.790861 10.5,6 C10.5,8.14219539 12.1839685,9.89107888 14.3003597,9.99510469 L14.5,10 L16.086,10 L14.7905396,8.70475311 C14.4300556,8.34426915 14.4023261,7.7770381 14.7073509,7.38474689 L14.7905396,7.29053955 C15.1510235,6.93005559 15.7182546,6.90232605 16.1105458,7.20735094 L16.2047531,7.29053955 L19.1985438,10.284432 C19.2042862,10.2900387 19.2099613,10.2957138 19.215568,10.3014562 L19.9142136,11 L16.2047531,14.7094604 C15.8142288,15.0999847 15.1810638,15.0999847 14.7905396,14.7094604 C14.4300556,14.3489765 14.4023261,13.7817454 14.7073509,13.3894542 L14.7905396,13.2952469 L16.084,12 L14.5,12 C11.1862915,12 8.5,9.3137085 8.5,6 C8.5,2.76160306 11.0655749,0.122428238 14.2750617,0.00413847206 L14.5,0 Z" id="Combined-Shape" fill="#CCD1F2" transform="translate(14.207107, 7.501177) scale(-1, -1) translate(-14.207107, -7.501177) " />
                            </g>
                        </g>
                    </g>
                <text className="foreach-text" id="ForeachText" transform="translate(3.889 49.851) rotate(-45)">
                    <tspan x="32.75" y="10" >For</tspan>
                    <tspan x="31.80" y="22">Each</tspan>
                </text>
                </g>
            </TooltipCodeSnippet>
        </svg>
    )
}
