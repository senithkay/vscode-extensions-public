/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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

import {statementEditorStyles} from "../ViewContainer/styles";

export function RightPane() {
    const overlayClasses = statementEditorStyles();

    return (
        <div className={overlayClasses.rightPane}>
            <div className={overlayClasses.shortcutPanel}>
                <div className={overlayClasses.shortcutTab} style={{borderBottom: '1px solid #40404B', color: '#1D2028'}}>Variables</div>
                <div className={overlayClasses.shortcutTab}>Constants</div>
                <div className={overlayClasses.shortcutTab}>Functions</div>
                <div className={overlayClasses.shortcutTab} style={{width: '10%'}}>{`>`}</div>
            </div>
            <div className={overlayClasses.rightPaneBlock} />
            <div className={overlayClasses.shortcutsDivider} />
            {/*<div className={overlayClasses.AppRightPaneBlock}>*/}
            {/*    <h4 className={overlayClasses.AppRightPaneHeading}>Constants</h4>*/}
            {/*</div>*/}
            {/*<div className={overlayClasses.AppRightPaneBlock}>*/}
            {/*    <h4 className={overlayClasses.AppRightPaneHeading}>Functions</h4>*/}
            {/*</div>*/}
            {/*<div className={overlayClasses.AppRightPaneBlock}/>*/}

        </div>
    );
}
