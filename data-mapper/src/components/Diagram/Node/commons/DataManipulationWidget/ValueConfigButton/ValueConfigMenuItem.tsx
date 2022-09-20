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
import React from 'react';

import MenuItem from "@material-ui/core/MenuItem";

export interface ValueConfigMenuItem {
    title: string;
    onClick: () => void;
    onClose?: () => void;
}

export function ValueConfigMenuItem(props: ValueConfigMenuItem) {
    const { title, onClick, onClose } = props;

    const onClickMenuItem = () => {
        onClick();
        onClose();
    }

    return (
        <MenuItem
            key={title}
            onClick={onClickMenuItem}
            disabled={!onClick}
        >
            {title}
        </MenuItem>
    );
}
