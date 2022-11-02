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
import React from 'react';

import { getConstructIcon } from '@wso2-enterprise/ballerina-low-code-edtior-commons';
import classNames from "classnames";

import { PlusMenuEntry } from "../../PlusOptionsSelector";

interface PlusOptionProps {
    entry: PlusMenuEntry;
    onOptionSelect: (entry: PlusMenuEntry) => void;
}

export function PlusOption(props: PlusOptionProps) {
    const { entry, onOptionSelect } = props;

    const hasSubMenu = entry.subMenu && entry.subMenu.length > 0;
    const onClick = () => {
        onOptionSelect(entry);
    }
    const subMenuElements: JSX.Element[] =
        hasSubMenu ?
            entry.subMenu.map(subMenuEntry => (
                <PlusOption
                    key={`plus-option-${entry.name.trim()}}`}
                    entry={subMenuEntry}
                    onOptionSelect={onOptionSelect}
                />
            )) : [];

    const subMenu = (
        <ul className="dropdown-menu" >
            {subMenuElements}
        </ul>
    )

    return (
        <li
            className={classNames({ 'dropdown-submenu': hasSubMenu })}
            onClick={!hasSubMenu ? onClick : null}
        >
            <div className="plus-option">
                <div className="plus-option-icon">
                    {getConstructIcon(entry.type)}
                </div>
                <div className="plus-option-text">
                    {entry.name}
                </div>
            </div>
            <div>
                {hasSubMenu && subMenu}
            </div>
        </li>
    )
}
