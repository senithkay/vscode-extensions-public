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

import { CSSProperties } from 'react';
import styled from '@emotion/styled';

export const Container = styled.div`
    font-family: GilmerRegular;
    font-size: 13px;
    letter-spacing: 0.8px;
    padding: 15px;
`;

export const clickableType: CSSProperties = {
    color: '#3366CC',
    cursor: 'grab',
    textDecoration: 'underline'
}

export const defaultType: CSSProperties = {
    cursor: 'default'
}
