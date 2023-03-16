/**
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
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
import { Colors, Level } from '../../../resources';

interface StyleProps {
    level: Level;
    isSelected: boolean;
}

export const Container = styled.div`
    background-color: ${(props: StyleProps) => props.level === Level.ONE ? `#FFFFFF` :
        props.isSelected ? Colors.SECONDARY_SELECTED : Colors.SECONDARY};
    border: ${(props: StyleProps) => `1px solid ${props.isSelected ? Colors.PRIMARY_SELECTED : Colors.PRIMARY}`};
    border-radius: 2px;
    color: ${Colors.PRIMARY};
    cursor: pointer;
    display: flex;
    flex-direction: column;
    min-height: 32px;
`;

export const DisplayName = styled.span`
    margin-left: 8px;
`;
