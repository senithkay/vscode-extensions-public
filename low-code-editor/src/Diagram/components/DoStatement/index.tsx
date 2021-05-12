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
import React, { useContext } from 'react';

import { DoStatement as BallerinaDoStatement } from "@ballerina/syntax-tree";

import { Context as DiagramContext } from "../../../Contexts/Diagram";
import { getDraftComponent, getSTComponents } from '../../utils';
import { DoViewState } from '../../view-state';
import { DefaultConfig } from '../../visitors/default';
import { OnFailClause } from '../OnFail';
import { PlusButton } from '../Plus';

import "./style.scss"
export interface DoStatementProps {
    model: BallerinaDoStatement;
}

const DOTEXTWIDTH: number = 14;

export function DoStatement(props: DoStatementProps) {

    const { state, insertComponentStart } = useContext(DiagramContext);

    const { model } = props;
    const pluses: React.ReactNode[] = [];
    const doViewState = model.viewState as DoViewState;
    const blockViewState = model.blockStatement.viewState;
    let drafts: React.ReactNode[] = [];

    for (const plusView of blockViewState.plusButtons) {
        pluses.push(<PlusButton viewState={plusView} model={model.blockStatement} initPlus={false} />)
    }

    if (blockViewState?.draft) {
        drafts = getDraftComponent(blockViewState, state, insertComponentStart);
    }

    const children = getSTComponents(model.blockStatement.statements);
    let onFailBlock: React.ReactNode;
    if (model.onFailClause) {
        onFailBlock = <OnFailClause model={model.onFailClause} />
    }

    return (
        <g>
            <rect
                x={doViewState.container.x}
                y={doViewState.container.y}
                width={doViewState.container.w}
                height={doViewState.container.h}
                rx="6.5"
                className="error-handdling"
            />
            <text
                x={doViewState.container.x + DefaultConfig.dotGap}
                y={doViewState.container.y + DOTEXTWIDTH + DefaultConfig.dotGap}
                className="error-handling-title"
            >
                DO
            </text>
            {...pluses}
            {...drafts}
            {...children}
            {onFailBlock}
        </g>
    );
}
