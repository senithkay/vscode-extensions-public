/*
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
import React from 'react';
import { Colors } from '../../model';

export function L2ServicesIcon() {
    return (
        <svg width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M2 8H8V11H2V8ZM3 9H7V10H3V9Z" fill={Colors.PRIMARY} />
            <path fillRule="evenodd" clipRule="evenodd" d="M0 14H16V0H0V14ZM15 1H1V6H15V1ZM1 7H15V13H1V7Z" fill={Colors.PRIMARY} />
        </svg>
    )
}
