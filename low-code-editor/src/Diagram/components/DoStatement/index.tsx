import React, { useContext } from 'react';

import { Context as DiagramContext } from "../../../Contexts/Diagram";
import { DoStatement as BallerinaDoStatement } from "@ballerina/syntax-tree";
import { getDraftComponent, getSTComponents } from '../../utils';
import { PlusButton } from '../Plus';
import { OnFailClause } from '../OnFail';
import { DoViewState } from '../../view-state';

export interface DoStatementProps {
    model: BallerinaDoStatement;
}

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
        onFailBlock = <OnFailClause model={model.onFailClause}/>
    }

    return (
        <g>
            <rect x={doViewState.container.x} y={doViewState.container.y} width={doViewState.container.w} height={doViewState.container.h} rx="6.5" fill="red" />
            {...pluses}
            {...drafts}
            {...children}
            {onFailBlock}
        </g>
    );
}