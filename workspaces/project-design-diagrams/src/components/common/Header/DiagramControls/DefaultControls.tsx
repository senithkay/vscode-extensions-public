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
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import { DiagramContext } from '../../DiagramContext/DiagramContext';
import { PackagesPopup } from '../PackagesPopup/PackagesPopup';
import { DiagramLayoutPopup } from '../DiagramLayoutPopup/DiagramLayoutPopup';
import { DagreLayout } from '../../../../resources';
import { AddButton } from '../../../../editing';
import { CentralControls } from '../styles/styles';
import '../styles/styles.css';

interface DefaultControlProps {
    projectPackages: Map<string, boolean>;
    layout: DagreLayout;
    changeLayout: () => void;
    updateProjectPkgs: (packages: Map<string, boolean>) => void;
    setShowEditForm: (show: boolean) => void;
}

export function DefaultControls(props: DefaultControlProps) {
    const { projectPackages, layout, changeLayout, setShowEditForm, updateProjectPkgs } = props;
    const { isChoreoProject, editingEnabled, refreshDiagram, showChoreoProjectOverview } = useContext(DiagramContext);

    const [pkgAnchorElement, setPkgAnchorElement] = useState<HTMLButtonElement>(null);
    const [layoutAnchorElement, setLayoutAnchorElement] = useState<HTMLButtonElement>(null);

    const openPkgsPopup = (event: React.MouseEvent<HTMLButtonElement>) => {
        setPkgAnchorElement(event.currentTarget);
    };

    const openLayoutPopup = (event: React.MouseEvent<HTMLButtonElement>) => {
        setLayoutAnchorElement(event.currentTarget);
    };

    const onClickProjectOverview = async () => {
        await showChoreoProjectOverview();
    }

    return (
        <>
            <CentralControls isChoreoProject={isChoreoProject}>
                {isChoreoProject && showChoreoProjectOverview &&
                    <Button
                        variant='outlined'
                        size='small'
                        className={'button'}
                        onClick={onClickProjectOverview}
                        startIcon={<AccountTreeIcon fontSize='medium' />}
                    >
                        Project Overview
                    </Button>
                }
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
                    startIcon={<AccountTreeIcon fontSize='medium' />}
                    endIcon={<ArrowDropdownIcon fontSize='medium' />}
                    onClick={openLayoutPopup}
                >
                    {layout === DagreLayout.TREE ? 'Tree' : 'Graph'} Layout
                </Button>
                <IconButton
                    className={'iconButton'}
                    size='small'
                    onClick={refreshDiagram}
                >
                    <CachedIcon fontSize='small' />
                </IconButton>
            </CentralControls>

            {editingEnabled && <AddButton setShowEditForm={setShowEditForm} />}

            <PackagesPopup
                anchorElement={pkgAnchorElement}
                closePopup={() => { setPkgAnchorElement(null) }}
                projectPackages={projectPackages}
                updateProjectPkgs={updateProjectPkgs}
            />

            <DiagramLayoutPopup
                anchorElement={layoutAnchorElement}
                closePopup={() => { setLayoutAnchorElement(null) }}
                currentLayout={layout}
                changeLayout={changeLayout}
            />
        </>
    )
}
