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

import { Tooltip } from '@wso2-enterprise/ballerina-low-code-edtior-commons';

import { JsonFieldTypes } from '../../forms/DraftFieldForm';

interface ObjectTypeDraftButtonProps {
    x: number,
    y: number,
    disabled?: boolean,
    handleClick?: (fieldType: JsonFieldTypes) => void,
}

export function ObjectTypeDraftButton(props: ObjectTypeDraftButtonProps) {
    const { disabled, handleClick, ...xyProps } = props;

    const onClick = (evt: any) => {
        handleClick(JsonFieldTypes.OBJECT);
    }

    return (
        <Tooltip
            arrow={true}
            placement="top-start"
            title={'Add complex field'}
            inverted={false}
            interactive={true}
        >
            <svg data-testid={'datamapper-add-json-object-field-btn'} id={'add-json-object-field-btn'} {...xyProps} onClick={onClick} className={'json-add-field-btn'} width="14px" height="16px" viewBox="0 0 14 16" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                <g id="Data-mapping" stroke="none" strokeWidth="1" fillRule="evenodd">
                    <g id="datamaping-input-variables" transform="translate(-1131.000000, -300.000000)" fillRule="nonzero">
                        <g id="Icon/Data/Folder-Copy" transform="translate(1131.000000, 300.500000)">
                            <path d="M4.5,8.5 C4.32479157,8.5 4.15659927,8.46996037 4.00029246,8.41475048 L4,12 C4,12.2454599 4.17687516,12.4496084 4.41012437,12.4919443 L4.5,12.5 L7,12.5 C7,11.6715729 7.67157288,11 8.5,11 L8.5,11 L12.5,11 C13.3284271,11 14,11.6715729 14,12.5 L14,12.5 L14,13.5 C14,14.3284271 13.3284271,15 12.5,15 L12.5,15 L8.5,15 C7.67157288,15 7,14.3284271 7,13.5 L7,13.5 L4.5,13.5 C3.72030388,13.5 3.07955132,12.9051119 3.00686658,12.14446 L3,12 L3,4 L1.5,4 C0.671572875,4 0,3.32842712 0,2.5 L0,2.5 L0,1.5 C0,0.671572875 0.671572875,0 1.5,0 L1.5,0 L5.5,0 C6.32842712,0 7,0.671572875 7,1.5 L7,1.5 L7,2.5 C7,3.32842712 6.32842712,4 5.5,4 L5.5,4 L4,4 L4,7 C4,7.24545989 4.17687516,7.44960837 4.41012437,7.49194433 L4.5,7.5 L7,7.5 C7,6.67157288 7.67157288,6 8.5,6 L8.5,6 L12.5,6 C13.3284271,6 14,6.67157288 14,7.5 L14,7.5 L14,8.5 C14,9.32842712 13.3284271,10 12.5,10 L12.5,10 L8.5,10 C7.67157288,10 7,9.32842712 7,8.5 L7,8.5 L4.5,8.5 Z M12.5,12 L8.5,12 C8.22385763,12 8,12.2238576 8,12.5 L8,12.5 L8,13.5 C8,13.7761424 8.22385763,14 8.5,14 L8.5,14 L12.5,14 C12.7761424,14 13,13.7761424 13,13.5 L13,13.5 L13,12.5 C13,12.2238576 12.7761424,12 12.5,12 L12.5,12 Z M12.5,7 L8.5,7 C8.22385763,7 8,7.22385763 8,7.5 L8,7.5 L8,8.5 C8,8.77614237 8.22385763,9 8.5,9 L8.5,9 L12.5,9 C12.7761424,9 13,8.77614237 13,8.5 L13,8.5 L13,7.5 C13,7.22385763 12.7761424,7 12.5,7 L12.5,7 Z M5.5,1 L1.5,1 C1.22385763,1 1,1.22385763 1,1.5 L1,1.5 L1,2.5 C1,2.77614237 1.22385763,3 1.5,3 L1.5,3 L5.5,3 C5.77614237,3 6,2.77614237 6,2.5 L6,2.5 L6,1.5 C6,1.22385763 5.77614237,1 5.5,1 L5.5,1 Z" id="Combined-Shape" />
                        </g>
                    </g>
                </g>
            </svg>
        </Tooltip>
    );
}
