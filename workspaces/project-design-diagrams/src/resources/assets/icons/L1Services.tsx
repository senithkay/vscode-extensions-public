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

export function L1ServicesIcon() {
    return (
        <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M0 0V5H6.5V7.02746C4.25002 7.27619 2.5 9.18372 2.5 11.5C2.5 13.9853 4.51472 16 7 16C9.48528 16 11.5 13.9853 11.5 11.5C11.5 9.18372 9.74998 7.27619 7.5 7.02746V5H14V0H0ZM13 1H1V4H13V1ZM7 15C8.933 15 10.5 13.433 10.5 11.5C10.5 9.567 8.933 8 7 8C5.067 8 3.5 9.567 3.5 11.5C3.5 13.433 5.067 15 7 15Z" fill={Colors.PRIMARY} />
        </svg>
    )
}
