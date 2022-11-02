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

// tslint:disable: jsx-no-multiline-js
import React from "react";

import { CloseIcon } from "../../assets/icons";

import { useStyles } from "./styles";

export { default as Section } from "./Section";

export default function ConfigPanel(props: any) {
    const classes = useStyles();
    const { title, children, onClose, showClose } = props;

    return (
        <div className={classes.wrapper}>
            <div className={classes.header}>
                <p className={classes.title}>{title}</p>
                {(showClose) && (
                    <button className={classes.closeBtnWrapper} onClick={onClose}>
                        <CloseIcon className={classes.closeBtn} />
                    </button>
                )}
            </div>
            {children}
        </div>
    );
}
