/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */

import React, { useState } from 'react';
import { CMLocation as Location, CMRemoteFunction as RemoteFunction, CMResourceFunction as ResourceFunction } from '@wso2-enterprise/ballerina-languageclient';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Tooltip from '@mui/material/Tooltip';
import { NodeMenuPanel } from './NodeMenuPanel';
import { DeleteComponentDialog, EditLabelDialog } from './components';
import { EntryNodeModel, ServiceNodeModel } from '../../service-interaction';

interface NodeMenuProps {
    background: string;
    location: Location;
    linkingEnabled?: boolean;
    resourceFunction?: RemoteFunction | ResourceFunction; // TODO: Figure out a way to merge resource and service
    node?: ServiceNodeModel | EntryNodeModel;
}

export function NodeMenuWidget(props: NodeMenuProps) {
    const { linkingEnabled, location, node, resourceFunction, background } = props;
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
                            node={node}
                            resource={resourceFunction}
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

            {node &&
                <>
                    <EditLabelDialog
                        node={node}
                        showDialog={showEditLabelDialog}
                        updateShowDialog={updateShowEditLabelDialog}
                    />

                    <DeleteComponentDialog
                        isService={node instanceof ServiceNodeModel}
                        location={location}
                        showDialog={showDeleteDialog}
                        updateShowDialog={updateShowDeleteDialog}
                    />
                </>
            }
        </>
    );
}
