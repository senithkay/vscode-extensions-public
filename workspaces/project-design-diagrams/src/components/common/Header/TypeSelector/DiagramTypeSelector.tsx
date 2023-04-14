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
import styled from '@emotion/styled';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { DiagramContext } from '../../DiagramContext/DiagramContext';
import { CellViewIcon, L1ServicesIcon, L2ServicesIcon, TypesDiagramIcon, Views } from '../../../../resources';

const ViewTypePanel = styled.div`
    display: flex;
    flex-direction: column;
    gap: 5px;
    justify-content: space-between;
    left: 15px;
    position: absolute;
    top: 60px;
    width: 40px;
    z-index: 10;
`;

interface ViewSwitcherProps {
    setShowTypeDropdown: (status: boolean) => void;
}

interface ViewTypes {
    type: Views;
    label: string;
    icon: ReactElement;
}

const switchables: ViewTypes[] = [
    {
        type: Views.L1_SERVICES,
        label: 'Services',
        icon: <L1ServicesIcon />
    },
    {
        type: Views.L2_SERVICES,
        label: 'Resources',
        icon: <L2ServicesIcon />
    },
    {
        type: Views.CELL_VIEW,
        label: 'Cell View',
        icon: <CellViewIcon />
    },
    {
        type: Views.TYPE,
        label: 'Types',
        icon: <TypesDiagramIcon />
    }
];

export function ViewSwitcher(props: ViewSwitcherProps) {
    const { isChoreoProject, setCurrentView } = useContext(DiagramContext);
    const { setShowTypeDropdown } = props;

    const handleOnClick = (type: Views) => {
        setShowTypeDropdown(false);
        setCurrentView(type);
    }

    return (
        <ViewTypePanel onMouseLeave={() => setShowTypeDropdown(false)}>
            {
                switchables.map((viewType) => {
                    if (viewType.type !== Views.CELL_VIEW || (viewType.type === Views.CELL_VIEW && isChoreoProject)) {
                        return (
                            <Tooltip
                                arrow
                                placement={'right-end'}
                                title={viewType.label}
                                componentsProps={{
                                    tooltip: {
                                        sx: {
                                            fontFamily: 'GilmerRegular',
                                            fontSize: '11px',
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
