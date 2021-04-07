import React, { useContext } from "react";
import { OnFailClause as BallerinaOnFailClause } from "@ballerina/syntax-tree";
import cn from "classnames";

import { Context as DiagramContext } from "../../../Contexts/Diagram";
import { getSTComponents } from "../../utils";
import { WorkerLine } from "../WorkerLine";
import { OnErrorViewState } from "../../view-state";

import "../workerLine/style.scss";

export interface OnFailClauseProps {
    model: BallerinaOnFailClause;
}

export function OnFailClause(props: OnFailClauseProps) {
    // const { state, insertComponentStart } = useContext(DiagramContext);

    const { model } = props;
    const classes = cn("worker-line");
    const viewState: OnErrorViewState = model.viewState as OnErrorViewState;
    const children = getSTComponents(model.blockStatement.statements);

    let lifeLine: React.ReactNode = null;
    if (viewState) {
        lifeLine = <line x1={viewState.lifeLine.x} y1={viewState.lifeLine.y} x2={viewState.lifeLine.x} y2={viewState.lifeLine.y + viewState.lifeLine.h} />
    }

    return (
        <g>
            <g className={classes}>
                {lifeLine}
            </g>
            {...children}
        </g>
    );
}