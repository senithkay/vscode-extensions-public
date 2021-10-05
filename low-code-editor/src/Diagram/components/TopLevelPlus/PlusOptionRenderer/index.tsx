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

import { DraftInsertPosition, DraftUpdatePosition } from "../../../view-state/draft";
import { getConstructIcon } from "../../Portals/utils";
import { PlusMenuEntry } from "../PlusOptionsSelector";

import "./style.scss";

interface PlusOptionRendererProps {
    entries: PlusMenuEntry[];
    onClose: () => void;
    onOptionSelect: (entry: PlusMenuEntry) => void;
    targetPosition: DraftUpdatePosition;
}

export function PlusOptionRenderer(props: PlusOptionRendererProps) {
    const { entries, onClose, onOptionSelect } = props;

    const plusOptions: JSX.Element[] = entries.map((entry, i) => {

        const onClick = () => {
            onOptionSelect(entry);
        }

        return (
            <>
                <div key={`plus-option-${i}`} className="plus-option" onClick={onClick}>
                    <div className="plus-option-icon">
                        {getConstructIcon(entry.type, { color: '#CBCEDB' })}
                    </div>
                    <div className="plus-option-text">
                        {entry.name}
                    </div>
                </div>
                {i < entries.length - 1 ? < div className="plus-option-separator" /> : null}
            </>
        )
    });

    return (
        <ClickAwayListener
            mouseEvent="onMouseDown"
            touchEvent="onTouchStart"
            onClickAway={onClose}
        >
            <div className="plus-option-container">
                {plusOptions}
            </div>
        </ClickAwayListener>
    )
}
