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

export function ScheduledTriggerIcon() {
    return (
        <svg width="14px" height="14px" viewBox="0 0 45 40" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" stroke={Colors.PRIMARY} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round">
                <path d="m2.5 24.09a21.5 21.5 0 1 0 21.5-21.5" /><path d="m24 24.09-15.2-15.2" />
            </g>
        </svg>
    );
}
