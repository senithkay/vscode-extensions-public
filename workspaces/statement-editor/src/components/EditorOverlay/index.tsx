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
// tslint:disable: jsx-no-multiline-js
import React from "react";

import PullingModuleImg from "../../assets/images/PullingModuleImg";
import SourceMissingImg from "../../assets/images/SourceMissingImg";
import { useStatementEditorStyles } from "../styles";

import { useStyles } from "./style";

export enum OverlayType {
    Disabled,
    ModulePulling,
}

export interface EditorOverlayProps {
    type: OverlayType;
}

export function EditorOverlay(props: EditorOverlayProps) {
    const { type } = props;
    const classes = useStyles();
    const overlayClasses = useStatementEditorStyles();

    return (
        <div className={overlayClasses.mainStatementWrapper} data-testid="editor-overlay">
            {type === OverlayType.Disabled && (
                <div className={overlayClasses.loadingWrapper}>
                    <SourceMissingImg />
                    <p className={classes.title}>Source code has been changed</p>
                    <p className={classes.subtitle}>Please retry editing a statement</p>
                </div>
            )}
            {type === OverlayType.ModulePulling && (
                <div className={overlayClasses.loadingWrapper}>
                    <PullingModuleImg />
                    <p className={classes.title}>Pulling packages</p>
                    <p className={classes.subtitle}>It takes some time</p>
                </div>
            )}
        </div>
    );
}
