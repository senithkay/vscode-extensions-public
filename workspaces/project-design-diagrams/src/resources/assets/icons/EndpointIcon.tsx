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
import { Colors } from '../../types';

export function EndpointIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
            <g fill={Colors.DEFAULT_TEXT}>
                <path d="M6 1v2h1.889c.49 0 .889.398.889.889v.222c0 .491-.398.889-.89.889H6v6h2c.49 0 .889.398.889.889v.222c0 .491-.398.889-.889.889H6v2c-3.314 0-6-2.686-6-6V7c0-3.238 2.566-5.878 5.775-5.996L6 1z" />
                <path d="M10 15V1c3.314 0 6 2.686 6 6v2c0 3.314-2.686 6-6 6z" opacity=".3" />
            </g>
        </svg>
    )
}
