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

import ComponentExpandIcon from "../../../../../../../../assets/icons/ComponentExpandIcon";
import { ButtonWithIcon } from "../../../Button/ButtonWithIcon";
import { statementEditorStyles } from "../ViewContainer/styles";

export function RightPane() {
    const overlayClasses = statementEditorStyles();

    return (
        <div className={overlayClasses.rightPane}>
            <div className={overlayClasses.rhsShortcutPanel}>
                <div className={overlayClasses.shortcutTab} style={{borderBottom: '1px solid #40404B', color: '#1D2028'}}>Variables</div>
                <div className={overlayClasses.shortcutTab}>Constants</div>
                <div className={overlayClasses.shortcutTab}>Functions</div>
                <div className={overlayClasses.shortcutTab} style={{width: '10%'}}>
                    <div style={{ marginLeft: "auto", marginRight: 0, transform: 'rotate(270deg)' }}>
                        <ButtonWithIcon
                            icon={<ComponentExpandIcon/>}
                            onClick={undefined}
                        />
                    </div>
                </div>
            </div>
            <div className={overlayClasses.rightPaneBlock} />
            <div className={overlayClasses.shortcutsDivider} />
            <div className={overlayClasses.rhsShortcutPanel}>
                <span className={overlayClasses.subHeader}>Language Library</span>
                <div style={{ marginLeft: "auto", marginRight: 0 }}>
                    <ButtonWithIcon
                        icon={<ComponentExpandIcon/>}
                        onClick={undefined}
                    />
                </div>
            </div>
            <div className={overlayClasses.shortcutsDivider} />
            <div className={overlayClasses.rhsShortcutPanel}>
                <span className={overlayClasses.subHeader}>Standard Library</span>
                <div style={{ marginLeft: "auto", marginRight: 0 }}>
                    <ButtonWithIcon
                        icon={<ComponentExpandIcon/>}
                        onClick={undefined}
                    />
                </div>
            </div>
            <div className={overlayClasses.shortcutsDivider} />
        </div>
    );
}
