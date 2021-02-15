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

import { TooltipCodeSnippet } from "../Portals/ConfigForm/Elements/Tooltip"

import "./style.scss";

export const PROCESS_SVG_WIDTH_WITH_HOVER_SHADOW = 142;
export const PROCESS_SVG_HEIGHT_WITH_HOVER_SHADOW = 94;
export const PROCESS_SVG_WIDTH_WITH_SHADOW = 109;
export const PROCESS_SVG_HEIGHT_WITH_SHADOW = 61;
export const PROCESS_SVG_WIDTH = 96;
export const PROCESS_STROKE_HEIGHT = 1;
export const PROCESS_SVG_HEIGHT = 48 + PROCESS_STROKE_HEIGHT;
export const PROCESS_SVG_SHADOW_OFFSET = PROCESS_SVG_HEIGHT_WITH_SHADOW - PROCESS_SVG_HEIGHT;


export function ProcessSVG(props: { x: number, y: number, varName: any, processType: string, sourceSnippet: any}) {
    const { varName, processType, sourceSnippet, ...xyProps } = props;

    const VarIcon = () => (
        <g id="Develop" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
            <g id="develop-variable" transform="translate(-487.000000, -220.000000)" fill="#5567D5" fill-rule="nonzero">
                <g id="Flowchart/Shape/Process/Default-Copy" transform="translate(484.000000, 216.000000)">
                    <g id="Icon/Fx" transform="translate(7.000000, 8.000000)">
                        <path
                            d="M3.69980469,0.708984375 L3.51736834,0.94603588 C3.03395785,1.60267168 2.57523872,2.45529514 2.14121094,3.50390625 C1.90292969,4.08984375 1.71152344,4.79882812 1.56699219,5.63085938 C1.42246094,6.46289062 1.35019531,7.20898438 1.35019531,7.86914062 C1.35019531,8.57226562 1.41367187,9.2578125 1.540625,9.92578125 C1.66757812,10.59375 1.85214844,11.2050781 2.09433594,11.7597656 L2.09433594,11.7597656 L1.26230469,11.7597656 L1.07293294,11.3631999 C0.770469835,10.7021213 0.533789062,10.0403646 0.362890625,9.37792969 C0.1578125,8.58300781 0.0552734375,7.84960938 0.0552734375,7.17773438 C0.0552734375,6.11523438 0.273046875,5.0703125 0.70859375,4.04296875 C1.14414062,3.015625 1.85410156,1.90429688 2.83847656,0.708984375 L2.83847656,0.708984375 L3.69980469,0.708984375 Z M14.6728516,0.708984375 L14.8674316,1.13175456 C15.1774902,1.83135308 15.4163411,2.50585938 15.5839844,3.15527344 C15.7851562,3.93457031 15.8857422,4.64648438 15.8857422,5.29101562 C15.8857422,6.01757812 15.7841797,6.73242187 15.5810547,7.43554688 C15.3779297,8.13867188 15.0771484,8.8359375 14.6787109,9.52734375 C14.2802734,10.21875 13.7490234,10.9628906 13.0849609,11.7597656 L13.0849609,11.7597656 L12.2236328,11.7597656 L12.4393311,11.473938 C12.651001,11.180603 12.8505859,10.8647461 13.0380859,10.5263672 C13.2880859,10.0751953 13.5273437,9.57617188 13.7558594,9.02929688 C13.984375,8.48242188 14.1796875,7.78808594 14.3417969,6.94628906 C14.5039062,6.10449219 14.5849609,5.3203125 14.5849609,4.59375 C14.5849609,3.89453125 14.5205078,3.2109375 14.3916016,2.54296875 C14.2626953,1.875 14.0751953,1.26367188 13.8291016,0.708984375 L13.8291016,0.708984375 L14.6728516,0.708984375 Z M7.77448071,2.64724919 C7.93273986,2.84861561 8.06330366,3.09277238 8.16617211,3.37971953 C8.26904055,3.66666667 8.3468513,3.97123337 8.39960435,4.29341963 L8.39960435,4.29341963 L8.48664688,4.79935275 C9.08803165,4.01905789 9.57204088,3.47159295 9.93867458,3.15695793 C10.3053083,2.84232291 10.6627102,2.68500539 11.0108803,2.68500539 C11.4276294,2.68500539 11.7151335,2.82092772 11.8733927,3.09277238 C11.9577976,3.23372887 12,3.40489033 12,3.60625674 C12,3.81265732 11.9129575,4.00143833 11.7388724,4.17259978 C11.5647873,4.34376124 11.3537751,4.42934196 11.1058358,4.42934196 C10.952852,4.42934196 10.7800857,4.3739662 10.5875371,4.26321467 C10.3949885,4.15246314 10.2485987,4.09708738 10.148368,4.09708738 C9.95318167,4.09708738 9.76722717,4.19273643 9.59050445,4.38403452 C9.41378173,4.57533261 9.10913287,4.98058252 8.67655786,5.59978425 L8.67655786,5.59978425 L8.82690406,6.35490831 C8.90603363,6.74253866 8.97197494,7.0609493 9.02472799,7.31014024 C9.07748104,7.55933118 9.1355094,7.78964401 9.19881306,8.00107875 C9.28321794,8.29306005 9.36762282,8.50449479 9.4520277,8.63538296 C9.53643258,8.76627113 9.66040224,8.83171521 9.8239367,8.83171521 C9.97164524,8.83171521 10.1510056,8.72851492 10.3620178,8.52211435 C10.4780745,8.41136282 10.6547972,8.20747932 10.892186,7.91046386 L10.892186,7.91046386 L11.2245302,8.12944984 C10.944939,8.57749011 10.5822618,9.00287666 10.1364985,9.40560949 C9.69073525,9.80834232 9.25420376,10.0097087 8.82690406,10.0097087 C8.46818332,10.0097087 8.17276624,9.86875225 7.94065282,9.58683927 C7.80877019,9.43581446 7.69271348,9.22941388 7.59248269,8.96763754 C7.53972964,8.83171521 7.4671942,8.59133405 7.37487636,8.24649407 C7.28255852,7.90165408 7.22321134,7.68896081 7.19683482,7.60841424 L7.19683482,7.60841424 L7.08605341,7.78964401 C6.56379822,8.64545128 6.18133861,9.201726 5.93867458,9.45846818 C5.57467854,9.84106437 5.15265414,10.0323625 4.67260138,10.0323625 C4.39828553,10.0323625 4.15957798,9.94300611 3.95647873,9.76429342 C3.75337949,9.58558073 3.65182987,9.36533621 3.65182987,9.10355987 C3.65182987,8.88709097 3.72700297,8.6869831 3.87734916,8.50323625 C4.02769535,8.31948939 4.23738872,8.22761597 4.50642928,8.22761597 C4.66996373,8.22761597 4.87174415,8.28299173 5.11177052,8.39374326 C5.3517969,8.50449479 5.50873722,8.55987055 5.58259149,8.55987055 C5.74612595,8.55987055 5.88724036,8.49065085 6.00593472,8.35221143 C6.12462908,8.21377202 6.35806133,7.87019058 6.70623145,7.3214671 L6.70623145,7.3214671 L7.02274975,6.82308522 C6.9699967,6.61165049 6.91328717,6.35239123 6.85262117,6.04530744 C6.79195516,5.73822366 6.72997033,5.42358864 6.66666667,5.10140237 L6.66666667,5.10140237 L6.54005935,4.45954693 C6.45037916,3.99640417 6.30794593,3.69183747 6.11275964,3.54584682 C6.00197824,3.46026609 5.81998022,3.41747573 5.56676558,3.41747573 C5.54038905,3.41747573 5.47708539,3.42125135 5.3768546,3.42880259 C5.2766238,3.43635383 5.17639301,3.44516361 5.07616222,3.45523193 L5.07616222,3.45523193 L5.07616222,3.0399137 C5.55093966,2.98453794 6.07187603,2.91405969 6.63897132,2.82847896 C7.2060666,2.74289824 7.58456973,2.68248831 7.77448071,2.64724919 Z"
                            id="Combined-Shape"
                        />
                    </g>
                </g>
            </g>
        </g>
    );
    const LogIcon = () => (
        <svg id="Icon_Flow_Log" data-name="Icon/Flow/Log" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
            <path id="Combined_Shape_Copy_7" data-name="Combined Shape Copy 7" d="M-1,6.586a1,1,0,0,0,1-1V1A1,1,0,0,0-1,0,1,1,0,0,0-2,1V4.586H-5.585a1,1,0,0,0-1,1,1,1,0,0,0,1,1Z" transform="translate(13.586 9.929) rotate(-45)" fill="#5567d5"/>
            <path id="Path" d="M6,16H2a2,2,0,0,1-2-2V2A2,2,0,0,1,2,0H12a2,2,0,0,1,2,2V7" transform="translate(5 4)" fill="none" stroke="#ccd1f2" stroke-linecap="round" stroke-miterlimit="10" stroke-width="2"/>
        </svg>
    )

    return (
        <svg {...xyProps} width={PROCESS_SVG_WIDTH_WITH_HOVER_SHADOW} height={PROCESS_SVG_HEIGHT_WITH_HOVER_SHADOW} className="process" >
            <defs>
                <linearGradient id="ProcessLinearGradient" x1="0.5" x2="0.5" y2="1" gradientUnits="objectBoundingBox">
                    <stop offset="0" stopColor="#fcfcfd" />
                    <stop offset="1" stopColor="#f7f8fb" />
                </linearGradient>
                <filter id="ProcessFilterDefault" x="-25" y="-10" width="142" height="94" filterUnits="userSpaceOnUse">
                    <feOffset dy="1" in="SourceAlpha" />
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feFlood floodColor="#a9acb6" floodOpacity="0.388" />
                    <feComposite operator="in" in2="blur" />
                    <feComposite in="SourceGraphic" />
                </filter>
                <filter id="ProcessFilterHover" x="-20" y="-10" width="142" height="94" filterUnits="userSpaceOnUse">
                    <feOffset dy="3" dx="1" in="SourceAlpha" />
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feFlood floodColor="#a9acb6" floodOpacity="0.388" />
                    <feComposite operator="in" in2="blur" />
                    <feComposite in="SourceGraphic" />
                </filter>
            </defs>
            <TooltipCodeSnippet content={sourceSnippet} placement="right" arrow={true}>
                <g id="Process" className="data-processor process-active" transform="translate(7 6)">
                    <g transform="matrix(1, 0, 0, 1, -7, -6)" >
                        <g id="ProcessRectangle" transform="translate(7 6)">
                            <rect width="95" height="48" rx="4" />
                            <rect x="0" y="0" width="96" height="48" rx="4.5" className="click-effect" />
                        </g>
                    </g>
                    <text className="process-text" id="ProcessText" transform="translate(16 14)">
                        <tspan data-testid="data-processor-text-block" dominantBaseline="central" x={PROCESS_SVG_WIDTH / 3} y="10">
                            {varName.length >= 9 && varName !== "New Variable" ? varName.slice(0, 8) + "..." : varName}
                        </tspan>
                    </text>
                    {processType === "Log" ? <LogIcon/> : <VarIcon/>}
                </g>
            </TooltipCodeSnippet>
        </svg>
    )
}
