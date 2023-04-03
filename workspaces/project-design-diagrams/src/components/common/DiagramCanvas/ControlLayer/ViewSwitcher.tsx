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

import React, { ReactElement, useContext } from 'react';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import DescriptionIcon from '@mui/icons-material/Description';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import WidgetsIcon from '@mui/icons-material/Widgets';
import WidgetsOutlinedIcon from '@mui/icons-material/WidgetsOutlined';
import { DiagramContext } from '../../DiagramContext/DiagramContext';
import { Colors, Views } from '../../../../resources';
import { ViewTypePanel } from '../styles/styles';
import '../styles/styles.css';

interface ViewTypes {
    type: Views;
    label: string;
    icon: ReactElement;
}

const switchables: ViewTypes[] = [
    {
        type: Views.L1_SERVICES,
        label: 'Service Diagram: Level 1',
        icon: <WidgetsOutlinedIcon fontSize="medium" sx={{ color: Colors.PRIMARY }} />
    },
    {
        type: Views.L2_SERVICES,
        label: 'Service Diagram: Level 2',
        icon: <WidgetsIcon fontSize="medium" sx={{ color: Colors.PRIMARY }} />
    },
    {
        type: Views.CELL_VIEW,
        label: 'Cell View',
        icon: <ImportExportIcon fontSize="medium" sx={{ color: Colors.PRIMARY }} />
    },
    {
        type: Views.TYPE,
        label: 'Type Diagram',
        icon: <DescriptionIcon fontSize="medium" sx={{ color: Colors.PRIMARY }} />
    }
];

export function ViewSwitcher() {
    const { currentView, isChoreoProject, setCurrentView } = useContext(DiagramContext);

    const handleOnClick = (type: Views) => {
        setCurrentView(type);
    }

    return (
        <ViewTypePanel isCellView={currentView === Views.CELL_VIEW}>
            {
                switchables.map((viewType) => {
                    if (viewType.type !== currentView &&
                        (viewType.type !== Views.CELL_VIEW || (viewType.type === Views.CELL_VIEW && isChoreoProject))) {
                        return (
                            <Tooltip
                                arrow
                                placement={'right-end'}
                                title={viewType.label}
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
                                    className={'control-button'}
                                    size='small'
                                    onClick={() => handleOnClick(viewType.type)}
                                >
                                    {viewType.icon}
                                </IconButton>
                            </Tooltip>
                        );
                    }
                })
            }
        </ViewTypePanel>
    );
}
