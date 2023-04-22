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
import Button from '@mui/material/Button';
import ReplyAllIcon from '@mui/icons-material/ReplyAll';
import { DiagramContext } from '../../DiagramContext/DiagramContext';
import { Views } from '../../../../resources';
import '../styles/styles.css';

interface RestrictedControlsProps {
    previousScreen: Views;
}

export function RestrictedControls(props: RestrictedControlsProps) {
    const { previousScreen } = props;
    const { setCurrentView } = useContext(DiagramContext);

    const goBack = () => {
        setCurrentView(previousScreen);
    }

    return (
        <div>
            <Button
                variant='outlined'
                size='small'
                className={'button'}
                startIcon={<ReplyAllIcon fontSize='small' />}
                onClick={goBack}
            >
                Go Back
            </Button>
        </div>
    );
}
