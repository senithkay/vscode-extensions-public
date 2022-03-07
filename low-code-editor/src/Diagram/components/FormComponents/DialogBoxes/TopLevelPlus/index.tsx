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
import { PlusWidgetProps } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

import { OverlayBackground } from "../../../OverlayBackground";
import { DiagramOverlay, DiagramOverlayContainer } from "../../../Portals/Overlay";

import { classMemberEntries, moduleLevelEntries, PlusMenuCategories, PlusOptionsSelector, triggerEntries } from "./PlusOptionsSelector";
import "./style.scss";


export function TopLevelOptionRenderer(props: PlusWidgetProps) {
    const { position, kind, onClose, targetPosition, isTriggerType, isLastMember, showCategorized, offset } = props;

    const getPlusMenuYPosition = (): number => {
        let menuHeight = 0;

        switch (kind) {
            case 'ModulePart':
                menuHeight += 42;
                const categroyMap: Map<PlusMenuCategories, number> = new Map();
                let rows = 0;

                moduleLevelEntries.forEach(entry => {
                    if (categroyMap.has(entry.category)) {
                        categroyMap.set(entry.category, categroyMap.get(entry.category) + 1);
                    } else {
                        categroyMap.set(entry.category, 1);
                    }
                });

                categroyMap.forEach(value => {
                    rows += Math.floor(value / 2) + value % 2;
                })

                menuHeight += 48 * rows;
                break;
            case 'ServiceDeclaration':
                menuHeight = isTriggerType ? (52 * triggerEntries.length) : (52 * classMemberEntries.length);
                break;
            default:
            // not used
        }

        if (offset + menuHeight >= window.innerHeight) {
            return offset - menuHeight;
        } else {
            return offset - 10;
        }
    }

    const positionY = position.y !== 0 && offset ? position.y : getPlusMenuYPosition();
    return (
        <DiagramOverlayContainer>
            <DiagramOverlay
                position={{ x: position.x, y: positionY }}
            >
                <PlusOptionsSelector
                    kind={kind}
                    onClose={onClose}
                    targetPosition={targetPosition}
                    isTriggerType={isTriggerType}
                    isLastMember={isLastMember}
                    showCategorized={showCategorized}
                />
                <OverlayBackground />
            </DiagramOverlay>
        </DiagramOverlayContainer>
    );
}
