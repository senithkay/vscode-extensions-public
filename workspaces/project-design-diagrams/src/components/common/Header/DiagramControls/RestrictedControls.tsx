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
import IconButton from '@mui/material/IconButton';
import ReplyAllIcon from '@mui/icons-material/ReplyAll';
import { Views } from '../../../../resources';
import '../styles/styles.css';

interface RestrictedControlsProps {
    previousScreen: Views;
    switchView: (view: Views) => void;
}

export function RestrictedControls(props: RestrictedControlsProps) {
    const { previousScreen, switchView } = props;

    const goBack = () => {
        switchView(previousScreen);
    }

    return (
        <div>
            <IconButton
                className={'iconButton'}
                size='small'
                onClick={() => { goBack() }}
            >
                <ReplyAllIcon fontSize='small' />
            </IconButton>
        </div>
    );
}
