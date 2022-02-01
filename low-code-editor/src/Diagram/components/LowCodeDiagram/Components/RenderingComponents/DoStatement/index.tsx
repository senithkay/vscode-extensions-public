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

import { DoStatement as BallerinaDoStatement } from "@wso2-enterprise/syntax-tree";

import { getDraftComponent, getSTComponents } from '../../../../../utils';
import { DefaultConfig } from '../../../../../visitors/default';
import { Context } from "../../../Context/diagram";
import { DoViewState } from '../../../ViewState';
import { PlusButton } from '../../PlusButtons/Plus';
import { OnFailClause } from '../OnFail';

import "./style.scss"
export interface DoStatementProps {
    model: BallerinaDoStatement;
}

const DOTEXTWIDTH: number = 14;

export function DoStatement(props: DoStatementProps) {

    const { state, actions: { insertComponentStart }, props: { isReadOnly } } = useContext(Context);

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
                x={doViewState.container.x - (DefaultConfig.dotGap * 2)}
                y={doViewState.container.y}
                width={doViewState.container.w + (DefaultConfig.dotGap * 4)}
                height={doViewState.container.h + (DefaultConfig.dotGap / 3)}
                rx="6.5"
                className="error-handdling"
            />
            <text
                x={doViewState.container.x - (DefaultConfig.dotGap * 1.25)}
                y={doViewState.container.y + DOTEXTWIDTH + (DefaultConfig.dotGap / 2.5)}
                className="error-handling-title"
            >
                DO
            </text>
            {!isReadOnly && pluses}
            {drafts}
            {children}
            {onFailBlock}
        </g>
    );
}
