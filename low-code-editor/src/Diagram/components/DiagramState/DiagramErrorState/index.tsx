/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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

export function DiagramErrorState(props: {
   x: number,
   y: number,
   text: string,
   onClose: () => void,
}) {
   const { text, onClose, ...xyProps } = props;
   return (
      <svg viewBox="0 0 500 45">
         <defs>
            <clipPath id="clip-path">
               <rect id="Mask" width="40" height="40" rx="20" fill="#d8d8d8" />
            </clipPath>
            <filter id="Oval" x="23" y="0" width="20" height="20" filterUnits="userSpaceOnUse">
               <feOffset dy="1" in="SourceAlpha" />
               <feGaussianBlur stdDeviation="0.5" result="blur" />
               <feFlood floodOpacity="0.231" />
               <feComposite operator="in" in2="blur" />
               <feComposite in="SourceGraphic" />
            </filter>
            <clipPath id="clip-path-2">
               <path id="Combined_Shape" d="M8.718,9.781,5,6.063,1.282,9.781a.751.751,0,0,1-1.061,0l0,0a.751.751,0,0,1,0-1.061L3.937,5,.219,1.282a.751.751,0,0,1,0-1.061l0,0a.751.751,0,0,1,1.061,0L5,3.937,8.718.219a.751.751,0,0,1,1.061,0l0,0a.751.751,0,0,1,0,1.061L6.063,5,9.781,8.718a.751.751,0,0,1,0,1.061l0,0a.751.751,0,0,1-1.061,0Z" transform="translate(4 4)" fill="#5567d5" />
            </clipPath>
         </defs>
         <g id="Group_202" data-name="Group 202" transform="translate(-146 -742)">
            <g id="TextWrapper">
               <rect id="Rectangle" width="422" height="40" rx="20" transform="translate(146 744)" fill="#fceded" />
               <text id="Code_has_errors_fix" data-name="Code has errors, fix" transform="translate(202 768)" fill="#40404b" font-size="12" font-family="GilmerRegular, Gilmer Regular"><tspan x="0" y="0">Code has errors, fix them first to activate the diagram</tspan></text>
            </g>
            <g id="ErrorBtnandIcon" transform="translate(146 744)">
               <g id="Button_Pill_40_Default_Copy" data-name="Button/Pill/40/Default Copy" clip-path="url(#clip-path)">
                  <g id="Purpose">
                     <rect id="Purpose-2" data-name="Purpose" width="40" height="40" fill="#fe523c" />
                  </g>
               </g>
               <g id="Icon_Analytics_Alerts" transform="translate(12 12)">
                  <path id="Combined_Shape-2" d="M14.8,14.5H1.2A1.211,1.211,0,0,1,0,13.282a1.232,1.232,0,0,1,.158-.6L6.958.614A1.2,1.2,0,0,1,8,0,1.2,1.2,0,0,1,9.043.614l6.8,12.065a1.229,1.229,0,0,1-.447,1.661A1.185,1.185,0,0,1,14.8,14.5ZM8,11.5a1,1,0,1,0,1,1A1,1,0,0,0,8,11.5Zm0-8a1,1,0,0,0-1,1v5a1,1,0,1,0,2,0v-5A1,1,0,0,0,8,3.5Z" transform="translate(0 0.5)" fill="#fff" />
               </g>
            </g>
            <g id="Counter">
               <g transform="matrix(1, 0, 0, 1, 146, 742)" filter="url(#Oval)">
                  <circle id="Oval-2" data-name="Oval" cx="8" cy="8" r="8" transform="translate(25 1)" fill="#fff" stroke="#fe523c" stroke-miterlimit="10" stroke-width="1" />
               </g>
               <text id="_4" data-name="4" transform="translate(175 755)" fill="#40404b" font-size="12" font-family="GilmerRegular, Gilmer Regular">
                  <tspan x="0" y="0">{text}</tspan></text>
            </g>
            <g id="CloseBtn" transform="translate(539 755)" onClick={onClose}>
               <g id="Group_28" data-name="Group 28">
                  <path id="Combined_Shape-3" d="M8.718,9.781,5,6.063,1.282,9.781a.751.751,0,0,1-1.061,0l0,0a.751.751,0,0,1,0-1.061L3.937,5,.219,1.282a.751.751,0,0,1,0-1.061l0,0a.751.751,0,0,1,1.061,0L5,3.937,8.718.219a.751.751,0,0,1,1.061,0l0,0a.751.751,0,0,1,0,1.061L6.063,5,9.781,8.718a.751.751,0,0,1,0,1.061l0,0a.751.751,0,0,1-1.061,0Z" transform="translate(4 4)" fill="#cbcedb" />
               </g>
            </g>
         </g>
      </svg>
   );
}
