/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
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

export function ShortGrpcIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 68 68">
            <path d="M27.125 36.16v12.46c0 2.593.44 4.847 1.323 6.762s2.044 3.506 3.485 4.773 3.06 2.225 4.853 2.873S40.39 64 42.212 64s3.632-.324 5.426-.972 3.412-1.606 4.853-2.873 2.603-2.858 3.485-4.773 1.323-4.17 1.323-6.762V27.86l-16.126-.025-.02 8.325H48.3v12.46c0 2.18-.603 3.786-1.8 4.818s-2.632 1.547-4.28 1.547-3.073-.516-4.28-1.547-1.8-2.637-1.8-4.818V15.38c0-2.18.603-3.786 1.8-4.818s2.632-1.547 4.28-1.547 3.073.516 4.28 1.547 1.8 2.638 1.8 4.818v3.182h9V15.38c0-2.534-.44-4.773-1.323-6.718s-2.044-3.55-3.485-4.818S49.432 1.62 47.64.97 44.035 0 42.212 0s-3.632.324-5.426.972-3.412 1.606-4.853 2.873-2.603 2.873-3.485 4.818-1.323 4.184-1.323 6.718v12.46h-9.207v-9.28h2.824l-7.02-9.92-7.02 9.92h2.92V32c0 2.298 1.857 4.16 4.15 4.16h13.355z" fill={Colors.DEFAULT_TEXT} fillRule="evenodd"/>
        </svg>
    );
}
