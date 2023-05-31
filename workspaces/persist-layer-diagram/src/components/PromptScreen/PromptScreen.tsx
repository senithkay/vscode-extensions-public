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
import { SxProps } from '@mui/material/styles';
import { Colors } from '../../resources';
import './styles.css';

const ButtonStyles: SxProps = {
    backgroundColor: Colors.PRIMARY,
    borderRadius: '5px',
    color: 'white',
    fontSize: '12px',
    marginInline: '5px',
    minWidth: '140px',
    '&:hover': {
        backgroundColor: Colors.PRIMARY_LIGHT
    }
};

export interface PromptScreenProps {
    userMessage: string;
    showProblemPanel: (() => void) | undefined;
}

export function PromptScreen(props: PromptScreenProps) {
    const { showProblemPanel, userMessage } = props;

    return (
        <div className={'container'}>
            <h3 className={'message-box'}>{userMessage}</h3>
            {showProblemPanel && <Fab
            id={'add-component-btn'}
            aria-label='add'
            variant='extended'
            size='small'
            onClick={showProblemPanel}
            sx={ButtonStyles}
        >
            <SearchIcon sx={{ marginRight: '5px' }} />
            View Diagnostics
        </Fab>}
        </div>
    );
}
