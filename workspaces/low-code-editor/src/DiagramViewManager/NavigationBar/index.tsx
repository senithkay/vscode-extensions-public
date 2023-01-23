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

import { ArrowBack, Home } from "@material-ui/icons";

import './style.scss';
import { useHistoryContext } from "../context/history";

export function NavigationBar() {
    const { history, historyPop, historyReset } = useHistoryContext();
    const homeButton = (
        <div className="btn-container" onClick={historyReset}>
            <Home />
        </div>
    );

    const backButton = (
        <div className="btn-container" onClick={historyPop}>
            <ArrowBack />
        </div>
    );

    const currentComponent = history.length > 0 ? history[history.length - 1] : undefined;

    return (
        <div id="nav-bar-main" className={'header-bar'}>
            {currentComponent && backButton}
            {currentComponent && homeButton}
            <div className="component-details">
                {/*<span className="module-text">{componentDetailsText}</span>*/}
                {history.length === 0 && <span className="module-text">Project Overview</span>}
            </div>
        </div>
    )
}

