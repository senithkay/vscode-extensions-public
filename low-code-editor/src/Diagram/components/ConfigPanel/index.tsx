/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
// tslint:disable: jsx-no-multiline-js
import React, { ReactNode, useContext } from "react";
import ReactDOM from "react-dom";

import CloseIcon from '@material-ui/icons/Close';

import { Context } from "../../../Contexts/Diagram";
import { TextPreloaderVertical } from "../../../PreLoader/TextPreloaderVertical";
import { ConfigForm } from "../Portals/ConfigForm";

import { useStyles } from "./styles";

export const CONFIG_PANEL_PORTAL_DIV_ID = "config-div-portal";

export function ConfigPanel() {
    const classes = useStyles();
    const { state, diagramCleanDraw } = useContext(Context);
    const { syntaxTree, configPanelStatus, appInfo} = state;
    const { currentApp: { id: appId } } = appInfo;
    const { maximize, minimize, setPrimaryRatio, setSecondaryRatio} = state;
    const maximizePanel = (applicationId: number | string) => maximize("home-lowcode", "vertical", applicationId);
    const minimizePanel = (applicationId: number | string) => minimize("home-lowcode", "vertical", applicationId);
    const dispatchPrimaryRatio = (applicationId: number | string) => setPrimaryRatio("home", "vertical", applicationId);
    const dispatchSecondaryRatio = (applicationId: number | string) => setSecondaryRatio("home", "vertical", applicationId);

    const { isLoading, isOpen, error, formArgs, formType } = configPanelStatus;

    const onClose = () => {
        if (configPanelStatus && configPanelStatus.blockViewState && configPanelStatus.blockViewState !== null) {
            configPanelStatus.blockViewState.draft = undefined;
            diagramCleanDraw(syntaxTree);
        }
    };

    const panelOpen = !isOpen ? classes.panelBackgroundNone : classes.panelBackground;
    let children: ReactNode;

    if (isLoading) {
        children = (<TextPreloaderVertical position='relative'/>);
    } else if (error) {
        // tslint:disable-next-line: jsx-wrap-multiline
        children = (<div className={classes.formError}> {error?.message} </div>);
    } else {
        children = (
            <ConfigForm
                type={formType}
                args={{ ...formArgs, onCancel: onClose }}
            />
        );
    }

    React.useEffect(() => {
        if (isOpen) {
            maximizePanel(appId);
            dispatchPrimaryRatio(appId);

        } else {
            minimizePanel(appId);
            dispatchSecondaryRatio(appId);
        }

    }, [isOpen])

    const configDiv = document.getElementById(CONFIG_PANEL_PORTAL_DIV_ID);
    const portalChildren = (
        <div className={panelOpen}>
            <button className={classes.closeBtn} onClick={onClose} >
                <CloseIcon fontSize="small"/>
            </button>
            <div id="config-panel">
                {children}
            </div>
        </div>
    );

    return configDiv ? ReactDOM.createPortal(portalChildren, configDiv) : null;
}
