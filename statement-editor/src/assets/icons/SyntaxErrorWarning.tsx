/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import React from 'react';

export default function SyntaxErrorWarning(props: any) {
  return (
    <svg width="139px" height="63px" viewBox="0 0 139 63" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
      <title>37F95FF1-263D-4E79-BE6B-1164218F865F</title>
      <defs>
        <path d="M6,0 L111,0 C114.313708,-8.55003309e-15 117,2.6862915 117,6 L117,26 C117,29.3137085 114.313708,32 111,32 L7.39946528,32 L7.39946528,32 L0,40 L0,6 C-4.05812251e-16,2.6862915 2.6862915,6.08718376e-16 6,0 Z" id="path-30" />
        <filter x="-13.7%" y="-37.5%" width="127.4%" height="181.9%" filterUnits="objectBoundingBox" id="filter-2">
          <feMorphology radius="0.5" operator="dilate" in="SourceAlpha" result="shadowSpreadOuter1" />
          <feOffset dx="0" dy="1" in="shadowSpreadOuter1" result="shadowOffsetOuter1" />
          <feGaussianBlur stdDeviation="5" in="shadowOffsetOuter1" result="shadowBlurOuter1" />
          <feComposite in="shadowBlurOuter1" in2="SourceAlpha" operator="out" result="shadowBlurOuter1" />
          <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.1 0" type="matrix" in="shadowBlurOuter1" />
        </filter>
      </defs>
      <g id="Tree-Editor" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="SE-errors-2" transform="translate(-874.000000, -281.000000)">
          <g id="Hint-with-text" transform="translate(885.000000, 291.000000)">
            <g id="Rectangle">
              <use fill="black" fill-opacity="1" filter="url(#filter-2)" xlinkHref="#path-30" />
              <use stroke="#F8C2C2" stroke-width="1" fill="#FFFFFF" fill-rule="evenodd" xlinkHref="#path-30" />
            </g>
            <text id="Fix-the-error-first" font-family="GilmerRegular, Gilmer Regular" font-size="12" font-weight="normal" line-spacing="16" fill="#40404B">
              <tspan x="12" y="15">Fix the error first</tspan>
            </text>
          </g>
        </g>
      </g>
    </svg>
  )
}
