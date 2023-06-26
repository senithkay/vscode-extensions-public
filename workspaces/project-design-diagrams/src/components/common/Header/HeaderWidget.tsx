/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
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
