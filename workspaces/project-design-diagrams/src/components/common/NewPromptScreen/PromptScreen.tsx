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

import React, { useContext } from 'react';
import { DiagramContext } from '../DiagramContext/DiagramContext';
import { AddButton } from '../../../editing';
import './styles.css';

const NO_COMPONENTS_MSG = 'No components were detected in the project workspace.';
export interface PromptScreenProps {
    setShowEditForm?: (status: boolean) => void;
}

export function PromptScreen(props: PromptScreenProps) {
    const { setShowEditForm } = props;
    const { editingEnabled, consoleView } = useContext(DiagramContext);

    return (
        <div id={"no-components-prompt-screen"} className={consoleView ? 'console-container' : 'container'}>
            <h3 className={'message-box'}>{NO_COMPONENTS_MSG}</h3>
            {(editingEnabled || consoleView) && <AddButton setShowEditForm={setShowEditForm}  />}
        </div>
    );
}
