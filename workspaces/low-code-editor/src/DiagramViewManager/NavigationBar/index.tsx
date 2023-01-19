/*
 * Copyright (c) 2023, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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

import { ArrowLeft, Home } from "@material-ui/icons";

import { DEFAULT_MODULE_NAME } from "../../OverviewDiagram";
import { ComponentViewInfo } from "../../OverviewDiagram/util";

import './style.scss';

interface NavigationBarProps {
    history: ComponentViewInfo[];
    goBack: () => void;
    goHome: () => void;
}


export function NavigationBar(props: NavigationBarProps) {
    const { history, goBack, goHome } = props;
    const homeButton = (
        <div className="btn-container" onClick={goHome}>
            <Home />
        </div>
    );

    const backButton = (
        <div className="btn-container" onClick={goBack}>
            <ArrowLeft />
        </div>
    );

    const currentComponent = history.length > 0 ? history[history.length - 1] : undefined;

    let componentDetailsText = 'Project Overview';

    if (currentComponent) {
        const { name, moduleName } = currentComponent;

        componentDetailsText = `${moduleName === DEFAULT_MODULE_NAME ? '' : `${moduleName}/`}${name}`;
    }

    const renderComponentDetails = () => {
        if (!currentComponent) {
            return undefined;
        } else {
            const { moduleName, filePath } = currentComponent;

            return (
                <>
                    <div className="file-path-details">
                        file path
                    </div>
                </>
            )
        }
    }

    return (
        <div id="nav-bar-main" className={'header-bar'}>
            {currentComponent && homeButton}
            {currentComponent && backButton}
            <div className="component-details">
                <span className="module-text">{componentDetailsText}</span>
            </div>
            {currentComponent && renderComponentDetails()}
        </div>
    )
}

