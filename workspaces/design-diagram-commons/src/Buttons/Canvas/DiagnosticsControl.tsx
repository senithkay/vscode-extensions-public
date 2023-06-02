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
import Tooltip from '@mui/material/Tooltip';
import WarningIcon from '@mui/icons-material/Warning';
import IconButton from '@mui/material/IconButton';
import { useStyles } from './style';

interface DiagnosticsWarningProps {
    onClick: () => void;
    tooltipTitle: string;
}

export function DiagnosticsWarning(props: DiagnosticsWarningProps) {
    const { onClick, tooltipTitle } = props;
    const styles = useStyles();

    return (
        <Tooltip
            arrow
            placement={'left-end'}
            title={tooltipTitle}
            componentsProps={{
                tooltip: {
                    sx: {
                        fontFamily: 'GilmerRegular',
                        fontSize: '12px',
                        padding: '6px'
                    }
                }
            }}
            PopperProps={{
                modifiers: [
                    {
                        name: 'offset',
                        options: {
                            offset: [0, -10],
                        },
                    },
                ],
            }}
        >
            <IconButton
                className={styles.controlButton}
                size='small'
                onClick={onClick}
            >
                <WarningIcon
                    fontSize='medium'
                    sx={{
                        color: '#EA4C4D',
                        cursor: 'pointer'
                    }}
                />
            </IconButton>
        </Tooltip>
    );
}
