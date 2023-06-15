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
import styled from '@emotion/styled';
import { Colors } from '../../resources';
import { NodeCollapser } from '../Controls/NodeCollapser';

interface HeaderProps {
    collapsedMode: boolean;
    setIsCollapsedMode: (collapsedMode: boolean) => void;
}

const HeaderContainer = styled.div`
    align-items: center;
    color: ${Colors.DEFAULT_TEXT};
    display: flex;
    flex-direction: row;
    font-family: GilmerBold;
    font-size: 16px;
    height: 50px;
    justify-content: space-between;
    min-width: 350px;
    padding-inline: 10px;
    width: calc(100vw - 20px);
`;

export function HeaderWidget(props: HeaderProps) {
    const {collapsedMode, setIsCollapsedMode} = props;

    return (
        <HeaderContainer>
            Entity Relationship Diagram
            <NodeCollapser collapsedMode={collapsedMode} setIsCollapsedMode={setIsCollapsedMode} />
        </HeaderContainer>
    );
}
