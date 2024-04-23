/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import React, { useState } from "react";

import { TreeContainer } from "../commons/Tree/Tree";
import { useDMSidePanelStore } from "../../../../store/store";
import { Codicon } from "@wso2-enterprise/ui-toolkit";
import { Label } from "../../OverriddenLinkLayer/LabelWidget";

export interface DataImportNodeWidgetProps {
    configName: string;
    ioType: string;
}

export function DataImportNodeWidget(props: DataImportNodeWidgetProps) {
    const {configName, ioType} = props;
    const setSidePanelOpen = useDMSidePanelStore(state => state.setSidePanelOpen);
    const setSidePanelIOType = useDMSidePanelStore(state => state.setSidePanelIOType);

    const handleOnClick = () => {
        setSidePanelOpen(true);
        setSidePanelIOType(ioType);
    };

    return (
        <div >
            <TreeContainer>
                <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', backgroundColor: 'var(--vscode-activityBar-background' }}>
                <div style={{padding: '100px', justifyContent: 'space-between'}}>
                    <Codicon sx={{ margin: 5, zoom: 5}}  name="new-file" onClick={handleOnClick} />
                    <Label style={{fontSize:15}}>Import {ioType} Schema</Label>
                </div>
                </div>
            </TreeContainer>
        </div >
    );
}
