/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import React, { useState } from 'react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Tooltip from '@mui/material/Tooltip';
import { NodeMenuPanel } from './NodeMenuPanel';
import { Location } from '../../../resources';

interface NodeMenuProps {
    location: Location;
    background: string;
    linkingEnabled?: boolean;
}

export function NodeMenuWidget(props: NodeMenuProps) {
    const { linkingEnabled, location, background } = props;

    const [showTooltip, setTooltipStatus] = useState<boolean>(false);

    return (
        <>
            {(linkingEnabled || location) &&
                <Tooltip
                    open={showTooltip}
                    onClose={() => setTooltipStatus(false)}
                    title={<NodeMenuPanel location={location} linkingEnabled={linkingEnabled} />}
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
                    componentsProps={{
                        tooltip: {
                            sx: {
                                backgroundColor: '#e6e6e6',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center'
                            }
                        },
                        arrow: {
                            sx: {
                                color: '#e6e6e6'
                            }
                        }
                    }}
                    arrow
                    placement='right'
                >
                    <MoreVertIcon
                        cursor='pointer'
                        onClick={() => setTooltipStatus(true)}
                        sx={{
                            backgroundColor: background,
                            borderRadius: '30%',
                            fontSize: '18px',
                            margin: '0px',
                            position: 'absolute',
                            right: 2.5
                        }}
                    />
                </Tooltip>
            }
        </>
    );
}
