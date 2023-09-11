/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
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
