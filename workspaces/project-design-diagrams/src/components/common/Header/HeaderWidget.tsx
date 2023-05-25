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
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import { RestrictedControls } from './DiagramControls/RestrictedControls';
import { DefaultControls } from './DiagramControls/DefaultControls';
import { DiagramContext } from '../DiagramContext/DiagramContext';
import { DagreLayout, Views } from '../../../resources';
import { ViewSwitcher } from './TypeSelector/DiagramTypeSelector';
import { HeaderLeftPane, DiagramTitle, HeaderContainer } from './styles/styles';

interface HeaderProps {
    layout: DagreLayout;
    prevView: Views;
    projectPackages: Map<string, boolean>;
    changeLayout: () => void;
    setShowEditForm: (show: boolean) => void;
    updateProjectPkgs: (packages: Map<string, boolean>) => void;
}

const headings: Map<Views, string> = new Map<Views, string>([
    [Views.TYPE, 'Type Diagram'],
    [Views.TYPE_COMPOSITION, 'Composition Diagram'],
    [Views.L1_SERVICES, 'Service Diagram: Level 1'],
    [Views.L2_SERVICES, 'Service Diagram: Level 2'],
    [Views.CELL_VIEW, 'Cell Diagram']
]);

export function DiagramHeader(props: HeaderProps) {
    const { layout, prevView, projectPackages, changeLayout, setShowEditForm, updateProjectPkgs } = props;
    const { currentView, editingEnabled } = useContext(DiagramContext);
    const [showTypeDropdown, setShowTypeDropdown] = useState<boolean>(false);

    return (
        <HeaderContainer>
            <HeaderLeftPane isEditable={editingEnabled}>
                {currentView !== Views.TYPE_COMPOSITION &&
                    <IconButton
                        className={'iconButton'}
                        size='small'
                        onMouseOver={() => setShowTypeDropdown(true)}
                    >
                        <MenuRoundedIcon fontSize={'small'} />
                    </IconButton>
                }
                <DiagramTitle>
                    {headings.get(currentView)}
                </DiagramTitle>
                {!editingEnabled &&
                    <Chip label={'Read-Only Mode'} sx={{ fontSize: '11px', fontFamily: 'GilmerRegular', marginLeft: '5px' }} />
                }
            </HeaderLeftPane>

            {currentView === Views.TYPE_COMPOSITION ?
                <RestrictedControls previousScreen={prevView} /> :
                <DefaultControls
                    projectPackages={projectPackages}
                    layout={layout}
                    updateProjectPkgs={updateProjectPkgs}
                    changeLayout={changeLayout}
                    setShowEditForm={setShowEditForm}
                />
            }

            {showTypeDropdown && <ViewSwitcher setShowTypeDropdown={setShowTypeDropdown} />}
        </HeaderContainer>
    );
}
