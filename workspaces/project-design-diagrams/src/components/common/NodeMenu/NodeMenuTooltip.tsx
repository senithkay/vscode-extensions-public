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
import { ElementLocation, ServiceRemoteFunction, ServiceResourceFunction } from '@wso2-enterprise/ballerina-languageclient';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Tooltip from '@mui/material/Tooltip';
import { NodeMenuPanel } from './NodeMenuPanel';
import { DeleteComponentDialog, EditLabelDialog } from './components';
import { ServiceNodeModel } from '../../service-interaction';

interface NodeMenuProps {
    background: string;
    location: ElementLocation;
    linkingEnabled?: boolean;
    resourceFunction?: ServiceResourceFunction | ServiceRemoteFunction; // TODO: Figure out a way to merge resource and service
    serviceNode?: ServiceNodeModel;
}

export function NodeMenuWidget(props: NodeMenuProps) {
    const { linkingEnabled, location, serviceNode, resourceFunction, background } = props;
    const [showTooltip, setTooltipStatus] = useState<boolean>(false);
    const [showEditLabelDialog, updateShowEditLabelDialog] = useState<boolean>(false);
    const [showDeleteDialog, updateShowDeleteDialog] = useState<boolean>(false);

    return (
        <>
            {location &&
                <Tooltip
                    open={showTooltip}
                    onClose={() => setTooltipStatus(false)}
                    title={
                        <NodeMenuPanel
                            linkingEnabled={linkingEnabled}
                            location={location}
                            resource={resourceFunction}
                            serviceNode={serviceNode}
                            handleDeleteComponentDialog={updateShowDeleteDialog}
                            handleEditLabelDialog={updateShowEditLabelDialog}
                        />
                    }
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
                                backgroundColor: 'none',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                padding: 0
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

            {serviceNode &&
                <>
                    <EditLabelDialog
                        service={serviceNode.serviceObject}
                        showDialog={showEditLabelDialog}
                        updateShowDialog={updateShowEditLabelDialog}
                    />

                    <DeleteComponentDialog
                        location={location}
                        showDialog={showDeleteDialog}
                        updateShowDialog={updateShowDeleteDialog}
                    />
                </>
            }
        </>
    );
}
