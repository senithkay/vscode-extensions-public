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

export interface FieldTypeSelectorButtonProps {
    selectedFieldType: JsonFieldTypes
    onClick: (type: JsonFieldTypes) => void;
}

export function AttributeTypeSelectButton(props: FieldTypeSelectorButtonProps) {
    const { selectedFieldType, onClick } = props;

    const fillColor: string = selectedFieldType === JsonFieldTypes.ATTRIBUTE ? '#5567D5' : '#CBCEDB';

    const handleOnClick = () => {
        onClick(JsonFieldTypes.ATTRIBUTE);
    }

    return (
        <IconButton size="small" onClick={handleOnClick} >
            <svg width="12px" height="14px" viewBox="0 0 12 14" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                <title>10020D0D-68FF-4121-920F-8E3B097CAFB0</title>
                <g id="Data-mapping" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                    <g id="datamaping-input-variables" transform="translate(-866.000000, -349.000000)" fill={fillColor} fill-rule="nonzero">
                        <g id="Icon/Data/Folder-Copy" transform="translate(866.500000, 349.000000)">
                            <path d="M11,12.5 C11,13.3284271 10.3284271,14 9.5,14 L9.5,14 L1.5,14 C0.671572875,14 0,13.3284271 0,12.5 L0,12.5 L0,1.5 C0,0.671572875 0.671572875,0 1.5,0 L1.5,0 L6.08578644,0 C6.35100293,-4.87194788e-17 6.60535684,0.10535684 6.79289322,0.292893219 L6.79289322,0.292893219 L10.7071068,4.20710678 C10.8946432,4.39464316 11,4.64899707 11,4.91421356 L11,4.91421356 Z M5.5,1 L1.5,1 C1.22385763,1 1,1.22385763 1,1.5 L1,1.5 L1,12.5 C1,12.7761424 1.22385763,13 1.5,13 L1.5,13 L9.5,13 C9.77614237,13 10,12.7761424 10,12.5 L10,12.5 L10,6 L7,6 C6.22030388,6 5.57955132,5.40511192 5.50686658,4.64446001 L5.5,4.5 L5.5,1 Z M10,4.97767018 L6.5,1.515 L6.5,4.5 C6.5,4.74545989 6.67687516,4.94960837 6.91012437,4.99194433 L7,5 L10,5 L10,4.97767018 Z" id="Combined-Shape" />
                        </g>
                    </g>
                </g>
            </svg>
        </IconButton>
    )
}
