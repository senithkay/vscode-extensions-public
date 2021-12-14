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

import { ClickAwayListener } from "@material-ui/core";
import { NodePosition } from "@wso2-enterprise/syntax-tree";

import { getConstructIcon } from "../../../../../Portals/utils";
import { PlusMenuEntry } from "../PlusOptionsSelector";

import { PlusOption } from "./PlusOption";
import "./style.scss";
import { TopLevelPlusHolder } from "../TopLevelPlusHolder";

interface PlusOptionRendererProps {
    entries: PlusMenuEntry[];
    onClose: () => void;
    onOptionSelect: (entry: PlusMenuEntry) => void;
    targetPosition: NodePosition;
    showCategorized?: boolean;
}

export function PlusOptionRenderer(props: PlusOptionRendererProps) {
    const { entries, onClose, onOptionSelect, showCategorized } = props;


    const simpleMenu = () => {
        const plusOptions: JSX.Element[] = entries.map(entry =>
            <PlusOption key={`plus-option-${entry.name.trim()}}`} entry={entry} onOptionSelect={onOptionSelect} />
        );

        return (
            <ul className="dropdown-menu">
                {plusOptions}
            </ul>
        );
    }

    const categorizedMenu = (
        <div className="dropdown-menu">
            <TopLevelPlusHolder entries={entries} onOptionSelect={onOptionSelect} />
        </div>
    );

    return (
        <ClickAwayListener
            mouseEvent="onMouseDown"
            touchEvent="onTouchStart"
            onClickAway={onClose}
        >
            <div className={'dropdown'}>
                {showCategorized ? categorizedMenu : simpleMenu()}
            </div>
        </ClickAwayListener>
    )
}
