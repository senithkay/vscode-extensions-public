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

interface ControlPanelProps {
    showDownloadButton?: boolean;
}

export const ControlPanel: React.FC<any> = styled.div`
    bottom: ${(props: ControlPanelProps) => `${props.showDownloadButton ? 15 : 50}px`};
    display: flex;
    flex-direction: column;
    gap: 5px;
    justify-content: space-between;
    position: absolute;
    right: 15px;
    width: 32px;
`;

export const ViewTypePanel: React.FC<any> = styled.div`
    display: flex;
    flex-direction: column;
    gap: 5px;
    justify-content: space-between;
    left: 15px;
    position: absolute;
    top: 100px;
    width: 40px;
`;
