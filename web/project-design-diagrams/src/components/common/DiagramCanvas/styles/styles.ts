/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the 'License'); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import styled from '@emotion/styled';

const background = require('../../../../resources/assets/PatternBg.svg') as string;

export const Container = styled.div`
    min-height: calc(100vh - 40px);
    min-width: 100vw;
`;

export const Canvas = styled.div`
    background-image: url('${background}');
	background-repeat: repeat;
`;

export const ControlPanel = styled.div`
    bottom: 15px;
    display: flex;
    flex-direction: column;
    height: 110px;
    justify-content: space-between;
    position: absolute;
    right: 15px;
    width: 32px;
`;

export const ExportButton = styled.div`
    bottom: 10px;
    height: 32px;
    left: 12px;
    position: absolute;
    width: 32px;
`;
