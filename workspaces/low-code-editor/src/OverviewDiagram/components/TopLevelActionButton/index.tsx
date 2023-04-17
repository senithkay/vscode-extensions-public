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
// tslint:disable: jsx-no-multiline-js
import React, { useState } from "react";

import { Button } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";

import { FormGenerator } from "../../../Diagram/components/FormComponents/FormGenerator";

import { useStyles } from './styles';

export function TopLevelActionButton() {
    const [showDrawer, setShowDrawer] = useState(false);
    const classes = useStyles();

    const handleActionBtnClick = () => {
        setShowDrawer(true);
    };

    const handleDrawerClose = () => {
        setShowDrawer(false);
    };

    return (
        <>
            <div
                className={classes.addComponentButton}
                onClick={handleActionBtnClick}
            >
                <AddIcon />
                <span>Component</span>
            </div>
            {showDrawer && (
                <FormGenerator
                    onCancel={handleDrawerClose}
                    configOverlayFormStatus={{
                        formType: "TopLevelOptionRenderer",
                        formArgs: {
                            kind: "ModulePart",
                            targetPosition: { startLine: 0, startColumn: 0 },
                            isTriggerType: false,
                            isLastMember: true,
                            showCategorized: true,
                        },
                        isLoading: false,
                    }}
                />
            )}
        </>
    );
}
