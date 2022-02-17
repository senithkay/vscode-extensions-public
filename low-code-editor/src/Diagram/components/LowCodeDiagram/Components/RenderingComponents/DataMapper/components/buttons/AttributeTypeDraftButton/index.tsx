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

interface AttributeTypeDraftButtonProps {
    x: number,
    y: number,
    disabled?: boolean,
    handleClick?: (fieldType: JsonFieldTypes) => void,
}

export function AttributeTypeDraftButton(props: AttributeTypeDraftButtonProps) {
    const { disabled, handleClick, ...xyProps } = props;

    const onClick = (evt: any) => {
        handleClick(JsonFieldTypes.ATTRIBUTE);
    }

    return (
        <Tooltip
            arrow={true}
            placement="top-start"
            title={'Add value field'}
            inverted={false}
            interactive={true}
        >
            <svg data-testid={'datamapper-add-json-attribute-field-btn'} id={'add-json-attribute-field-btn'} {...xyProps} onClick={onClick} width="15px" height="15px" viewBox="0 0 15 15" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                    <g id="datamaping-input-variables" className={'json-add-field-btn'} transform="translate(-1106.000000, -300.000000)" fillRule="nonzero">
                        <g id="Icon/Data/Folder-Copy" transform="translate(1106.000000, 300.500000)">
                            <path d="M13.5,6.5 C14.2796961,6.5 14.9204487,7.09488808 14.9931334,7.85553999 L15,8 L15,10.5857864 C15,10.8068002 14.9268355,11.0202705 14.7939194,11.193816 L14.7071068,11.2928932 L11.7928932,14.2071068 C11.6366129,14.3633871 11.4339315,14.4625983 11.2172304,14.4913276 L11.0857864,14.5 L6.5,14.5 C5.72030388,14.5 5.07955132,13.9051119 5.00686658,13.14446 L5,13 L5,8 C5,7.22030388 5.59488808,6.57955132 6.35553999,6.50686658 L6.5,6.5 L13.5,6.5 Z M13.5,7.5 L6.5,7.5 C6.25454011,7.5 6.05039163,7.67687516 6.00805567,7.91012437 L6,8 L6,13 C6,13.2454599 6.17687516,13.4496084 6.41012437,13.4919443 L6.5,13.5 L10,13.5 L10,11.5 C10,10.7203039 10.5948881,10.0795513 11.35554,10.0068666 L11.5,10 L14,10 L14,8 C14,7.75454011 13.8231248,7.55039163 13.5898756,7.50805567 L13.5,7.5 Z M13.487,11 L11.5,11 C11.2545401,11 11.0503916,11.1768752 11.0080557,11.4101244 L11,11.5 L11,13.5 L11.0223298,13.5 L13.487,11 Z M3.50333953,10 C3.7794819,10 4.00333953,10.2238576 4.00333953,10.5 C4.00333953,10.7761424 3.7794819,11 3.50333953,11 L3.50333953,11 L2.50333953,11 C2.22719715,11 2.00333953,10.7761424 2.00333953,10.5 C2.00333953,10.2238576 2.22719715,10 2.50333953,10 L2.50333953,10 Z M0.5,9 C0.776142375,9 1,9.22385763 1,9.5 L1,9.5 L1,10.5 C1,10.7761424 0.776142375,11 0.5,11 C0.223857625,11 5.96551079e-16,10.7761424 5.96551079e-16,10.5 L5.96551079e-16,10.5 L4.12854059e-16,9.5 C4.12854059e-16,9.22385763 0.223857625,9 0.5,9 Z M0.5,6 C0.776142375,6 1,6.22385763 1,6.5 L1,6.5 L1,7.5 C1,7.77614237 0.776142375,8 0.5,8 C0.223857625,8 4.54600195e-17,7.77614237 4.54600195e-17,7.5 L4.54600195e-17,7.5 L-1.38237e-16,6.5 C-1.38237e-16,6.22385763 0.223857625,6 0.5,6 Z M0.5,3 C0.776142375,3 1,3.22385763 1,3.5 L1,3.5 L1,4.5 C1,4.77614237 0.776142375,5 0.5,5 C0.223857625,5 -5.0563104e-16,4.77614237 -5.0563104e-16,4.5 L-5.0563104e-16,4.5 L-6.8932806e-16,3.5 C-6.8932806e-16,3.22385763 0.223857625,3 0.5,3 Z M0.5,2.75852261e-16 C0.776142375,2.58943417e-16 1,0.223857625 1,0.5 L1,0.5 L1,1.5 C1,1.77614237 0.776142375,2 0.5,2 C0.223857625,2 -1.0567221e-15,1.77614237 -1.0567221e-15,1.5 L-1.0567221e-15,1.5 L-1.24041912e-15,0.5 C-1.24041912e-15,0.223857625 0.223857625,2.92761104e-16 0.5,2.75852261e-16 Z" id="Combined-Shape" />
                        </g>
                    </g>
                </g>
            </svg>
        </Tooltip>
    );
}
