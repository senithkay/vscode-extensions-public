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
import Fab from '@mui/material/Fab';
import SearchIcon from '@mui/icons-material/Search';
import { useStyles } from './style';

export interface PromptScreenProps {
    userMessage: string;
    showProblemPanel: (() => void) | undefined;
}

export function PromptScreen(props: PromptScreenProps) {
    const { showProblemPanel, userMessage } = props;
    const styles = useStyles();

    return (
        <div className={styles.container}>
            <h3 className={styles.messageBox}>{userMessage}</h3>
            {showProblemPanel &&
                <Fab
                    aria-label='add'
                    className={styles.button}
                    id={'add-component-btn'}
                    onClick={showProblemPanel}
                    size='small'
                    variant='extended'
                >
                    <SearchIcon sx={{ marginRight: '5px' }} />
                    View Diagnostics
                </Fab>}
        </div>
    );
}
