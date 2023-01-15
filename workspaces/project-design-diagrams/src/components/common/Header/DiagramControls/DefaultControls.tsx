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

import React, { useContext, useState } from 'react';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import ArrowDropdownIcon from '@mui/icons-material/ArrowDropDown';
import CachedIcon from '@mui/icons-material/Cached';
import MenuIcon from '@mui/icons-material/Menu';
import JoinInnerIcon from '@mui/icons-material/JoinInner';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import { ProjectDesignRPC } from '../../../../utils/rpc/project-design-rpc';
import { DiagramContext } from '../../DiagramContext/DiagramContext';
import { PackagesPopup } from '../PackagesPopup/PackagesPopup';
import { MenuPanel } from '../../MenuPanel/MenuPanel';
import { Views } from '../../../../resources';
import '../styles/styles.css';

interface DefaultControlProps {
    projectPackages: Map<string, boolean>;
    switchView: (viewType: Views) => void;
    updateProjectPkgs: (packages: Map<string, boolean>) => void;
    onRefresh: () => void;
}

export function DefaultControls(props: DefaultControlProps) {
    const { projectPackages, switchView, updateProjectPkgs, onRefresh } = props;
    const { isChoreoProject } = useContext(DiagramContext);

    const [viewDrawer, updateViewDrawer] = useState<boolean>(false);
    const [anchorElement, setAnchorElement] = useState<HTMLButtonElement>(null);

    const openPkgsPopup = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorElement(event.currentTarget);
    };

    const onClickProjectOverview = () => {
        const rpcInstance = ProjectDesignRPC.getInstance();
        rpcInstance.showChoreoProjectOverview().catch((error: Error) => {
            rpcInstance.showErrorMessage(error.message);
        });
    }

    return (
        <>
            <MenuPanel
                drawerState={viewDrawer}
                updateDrawerState={updateViewDrawer}
                switchView={switchView}
            />

            <div>
                <IconButton
                    className={'iconButton'}
                    size='small'
                    onClick={() => { updateViewDrawer(true) }}
                >
                    <MenuIcon fontSize='small' />
                </IconButton>
                {isChoreoProject &&
                    <Button
                        variant='outlined'
                        size='small'
                        className={'button'}
                        onClick={onClickProjectOverview}
                        startIcon={<AccountTreeIcon fontSize='medium' />}
                    >
                        Project View
                    </Button>
                }
            </div>

            <div>
                <Button
                    variant='outlined'
                    size='small'
                    className={'button'}
                    startIcon={<ViewInArIcon fontSize='medium' />}
                    endIcon={<ArrowDropdownIcon fontSize='medium' />}
                    onClick={openPkgsPopup}
                >
                    Packages
                </Button>
                <Button
                    variant='outlined'
                    size='small'
                    className={'button'}
                    startIcon={<JoinInnerIcon fontSize='medium' />}
                    endIcon={<ArrowDropdownIcon fontSize='medium' />}
                >
                    Group By
                </Button>
                <IconButton
                    className={'iconButton'}
                    size='small'
                    onClick={() => { onRefresh() }}
                >
                    <CachedIcon fontSize='small' />
                </IconButton>
            </div>

            <PackagesPopup
                anchorElement={anchorElement}
                closePopup={() => { setAnchorElement(null) }}
                projectPackages={projectPackages}
                updateProjectPkgs={updateProjectPkgs}
            />
        </>
    )
}
