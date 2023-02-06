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
import styled from '@emotion/styled';
import { ControlsLayer } from '../../../editing';

const background = require('../../../resources/assets/PatternBg.svg') as string;

const Container = styled.div`
    align-items: center;
    background-image: url('${background}');
	background-repeat: repeat;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 100vh;
    min-width: 100vw;
`;

const MessageBox = styled.h3`
    color: #6b6b6b;
    font-family: GilmerRegular;
    font-size: 16px;
    padding: 10px;
`;

const NO_COMPONENTS_MSG = 'No components were detected in the project workspace.';

export function PromptScreen(props: { onComponentAdd: () => void }) {
    return (
        <Container id={"no-components-prompt-screen"}>
            <MessageBox>{NO_COMPONENTS_MSG}</MessageBox>
            <ControlsLayer
                onComponentAddClick={props.onComponentAdd}
                float={true}
            />
        </Container>
    );
}
