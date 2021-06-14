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

import { IconButton } from '@material-ui/core';

import { JsonFieldTypes } from '..';

import { FieldTypeSelectorButtonProps } from './AttributeTypeSelectButton';

export function ObjectTypeSelectButton(props: FieldTypeSelectorButtonProps) {
    const { selectedFieldType, onClick } = props;

    const fillColor: string = selectedFieldType === JsonFieldTypes.OBJECT ? '#5567D5' : '#CBCEDB';

    const handleOnClick = () => {
        onClick(JsonFieldTypes.OBJECT);
    }

    return (
        <IconButton size="small" onClick={handleOnClick} >
            <svg width="14px" height="14px" viewBox="0 0 14 14" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                <title>2C278FA5-3BEE-48E0-80AE-5DF58C8F8340</title>
                <g id="Data-mapping" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                    <g id="datamaping-input-variables" transform="translate(-830.000000, -349.000000)" fill={fillColor} fill-rule="nonzero">
                        <g id="Icon/Data/Folder-Copy-9" transform="translate(830.000000, 349.000000)">
                            <path d="M7.5,0 C8.32842712,0 9,0.671572875 9,1.5 L9,1.5 L9,4 L12.5,4 C13.2796961,4 13.9204487,4.59488808 13.9931334,5.35553999 L14,5.5 L14,12.5 C14,13.2796961 13.4051119,13.9204487 12.64446,13.9931334 L12.5,14 L6.5,14 C5.72030388,14 5.07955132,13.4051119 5.00686658,12.64446 L5,12.5 L5,10 L1.5,10 C0.720303883,10 0.0795513218,9.40511192 0.00686657806,8.64446001 L0,8.5 L0,1.5 C0,0.671572875 0.671572875,0 1.5,0 L1.5,0 Z M9,8.5 C9,9.32842712 8.32842712,10 7.5,10 L7.5,10 L6,10 L6,12.5 C6,12.7454599 6.17687516,12.9496084 6.41012437,12.9919443 L6.5,13 L12.5,13 C12.7454599,13 12.9496084,12.8231248 12.9919443,12.5898756 L13,12.5 L13,5.5 C13,5.25454011 12.8231248,5.05039163 12.5898756,5.00805567 L12.5,5 L9,5 Z M7.5,1 L1.5,1 C1.22385763,1 1,1.22385763 1,1.5 L1,1.5 L1,8.5 C1,8.77614237 1.22385763,9 1.5,9 L1.5,9 L7.5,9 C7.77614237,9 8,8.77614237 8,8.5 L8,8.5 L8,1.5 C8,1.22385763 7.77614237,1 7.5,1 L7.5,1 Z" id="Combined-Shape" />
                        </g>
                    </g>
                </g>
            </svg>
        </IconButton>
    )
}
