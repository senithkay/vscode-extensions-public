/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
import React from "react";

import { DEFAULT_MODULE_NAME } from "../..";
import { useOverviewDiagramContext } from "../../context/overview-diagram";
import { ComponentViewInfo } from "../../util";

import './style.scss';

interface NavigationBarProps {
    selectedComponent: ComponentViewInfo;
    diagramHasDepth: boolean;
    handleHomeClick: () => void;
}

export function NavigationBar(props: NavigationBarProps) {
    const { diagramHasDepth, handleHomeClick, selectedComponent } = props;
    const { isHistoryStackEmpty, navigateBack } = useOverviewDiagramContext();
    const homeButton = (
        <div className="segment">
            <button onClick={handleHomeClick}>Home</button>
        </div>
    );

    const backButton = (
        <div className="segment">
            <button onClick={navigateBack}>Back</button>
        </div>
    )

    return (
        <div className="top-bar">
            {!isHistoryStackEmpty() && backButton}
            {diagramHasDepth && homeButton}
            <div className="segment">{selectedComponent ? getPath(selectedComponent) : 'Project Overview'}</div>
        </div>
    )
}

function getPath(component: ComponentViewInfo): string {
    const project: string = `${component.projectName}/`;
    const moduleName: string = component.moduleName === DEFAULT_MODULE_NAME ? '' : `${component.moduleName}/`
    const fileName: string = component.filePath;
    return `${project}${moduleName}${fileName}`;
}
