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
import React from 'react';

export interface VariableIconProps {
    color?: string
}

export default function VariableIcon(props: VariableIconProps) {
    return (
        <svg width="16px" height="16px" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
            <title>B0BFC74F-E04F-4CC8-8DFB-8E50CABC1444</title>
            <g id="var-icon" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                <g id="var-icon-body" transform="translate(-114.000000, -200.000000)" fill={props.color ? props.color : "#40404B"} fill-rule="nonzero">
                    <path d="M120.566981,200.895341 L114.171996,213.651299 C114.058894,213.876903 114,214.125788 114,214.378155 C114,215.273874 114.726124,216 115.621842,216 L128.377801,216 C128.628999,216 128.876764,215.941648 129.101563,215.829548 C129.903145,215.429825 130.228917,214.455975 129.829194,213.654393 L123.46822,200.898435 C123.311619,200.584396 123.057387,200.329621 122.743683,200.17235 C121.942955,199.770919 120.968412,200.094613 120.566981,200.895341 Z M122.120664,201.415076 C122.165478,201.437543 122.201797,201.473939 122.224169,201.518802 L128.585143,214.27476 C128.642246,214.389272 128.595707,214.528394 128.481195,214.585497 C128.449081,214.601511 128.413686,214.609847 128.377801,214.609847 L115.621842,214.609847 C115.493883,214.609847 115.390151,214.506115 115.390151,214.378155 C115.390151,214.342102 115.398564,214.306547 115.414722,214.274318 L121.809706,201.51836 C121.857496,201.423035 121.962141,201.375035 122.061893,201.39487 L122.120664,201.415076 Z" id="variable"/>
                </g>
            </g>
        </svg>
    )
}

