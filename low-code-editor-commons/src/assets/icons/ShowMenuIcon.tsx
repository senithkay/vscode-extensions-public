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

export default function ShowMenuIcon(props: any) {
    const { onClick, ...restProps } = props;

    const handleOnClick = (evt: React.MouseEvent) => {
        evt.stopPropagation();
        if (props && onClick) {
            onClick();
        }
    }

    return (
        <svg id="menu-button" width="13px" height="13px" onClick={handleOnClick} {...restProps} >
            <defs>
                <path d="M0,15A15,15,0,1,1,15,30,15,15,0,0,1,0,15Zm92.93,0a15,15,0,1,1,15,15,15,15,0,0,1-15-15ZM46.46,15a15,15,0,1,1,15,15,15,15,0,0,1-15-15Z"/>
            </defs>
        </svg>
    )
}
