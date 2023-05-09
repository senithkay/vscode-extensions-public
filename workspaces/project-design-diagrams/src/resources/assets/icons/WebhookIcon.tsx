/**
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import React from 'react';
import { Colors } from '../../types';

export function WebhookIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M2 1C1.44772 1 1 1.44772 1 2C1 2.55228 1.44772 3 2 3C2.55228 3 3 2.55228 3 2C3 1.44772 2.55228 1 2 1ZM0 2C0 0.895431 0.895431 0 2 0C3.10457 0 4 0.895431 4 2C4 2.3709 3.89904 2.71823 3.72309 3.01598L6.12558 5.41847C7.17092 4.53358 8.52315 4 10 4C13.3137 4 16 6.68629 16 10C16 13.3137 13.3137 16 10 16C6.68629 16 4 13.3137 4 10C4 8.52315 4.53358 7.17092 5.41847 6.12558L3.01598 3.72309C2.71823 3.89904 2.3709 4 2 4C0.895431 4 0 3.10457 0 2ZM6.12853 6.83563C5.42318 7.69757 5 8.79937 5 10C5 12.7614 7.23858 15 10 15C12.7614 15 15 12.7614 15 10C15 7.23858 12.7614 5 10 5C8.79937 5 7.69757 5.42318 6.83563 6.12853L11 10.2929V7.50005C11 7.2239 11.2239 7.00005 11.5 7.00005C11.7762 7.00005 12 7.2239 12 7.50005V11.5V12H11.5H7.50005C7.2239 12 7.00005 11.7762 7.00005 11.5C7.00005 11.2239 7.2239 11 7.50005 11H10.2929L6.12853 6.83563Z" fill={Colors.PRIMARY} />
        </svg>
    );
}
