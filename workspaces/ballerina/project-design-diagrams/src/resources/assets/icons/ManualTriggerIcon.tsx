/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from 'react';
import { Colors } from '../../types';

export function ManualTriggerIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M7.04445 8.85714H6.04445H4.20504H3L3.6724 7.85714L7.95556 1.48721L8.95556 0V1.79215V5.57143V6.57143H9.95556H11.8172H13L12.3684 7.57143L8.04445 14.4168L7.04445 16V14.1275V9.85714V8.85714ZM7.04445 7.85714H4.87744L7.95556 3.27935V6.57143V7.57143H8.95556H11.1856L8.04445 12.5443V8.85714V7.85714H7.04445ZM1 3.5C1 2.67157 1.67157 2 2.5 2H5.5C5.77614 2 6 1.77614 6 1.5C6 1.22386 5.77614 1 5.5 1H2.5C1.11929 1 0 2.11929 0 3.5V12.5C0 13.8807 1.11929 15 2.5 15H5C5.27614 15 5.5 14.7761 5.5 14.5C5.5 14.2239 5.27614 14 5 14H2.5C1.67157 14 1 13.3284 1 12.5V3.5ZM11 1C10.7239 1 10.5 1.22386 10.5 1.5C10.5 1.77614 10.7239 2 11 2H13.5C14.3284 2 15 2.67157 15 3.5V12.5C15 13.3284 14.3284 14 13.5 14H10.5C10.2239 14 10 14.2239 10 14.5C10 14.7761 10.2239 15 10.5 15H13.5C14.8807 15 16 13.8807 16 12.5V3.5C16 2.11929 14.8807 1 13.5 1H11Z" fill={Colors.DEFAULT_TEXT} />
        </svg>
    );
}
