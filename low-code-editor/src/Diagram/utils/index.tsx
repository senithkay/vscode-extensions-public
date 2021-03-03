import React, { useContext } from "react";

import { Context as DiagramContext } from "../../Contexts/Diagram";
import * as stComponents from '../components';
import { ConnectorClient } from "../components/ActionInvocation/ConnectorClient";
import { IfElse } from "../components/IfElse";
import { DataProcessor } from "../components/Processor";
import { Respond } from "../components/Respond";
// import { insertComponentStart } from "../$store/actions/expression-editor";
import { BlockViewState } from "../view-state";
import { DraftInsertPosition, DraftStatementViewState } from "../view-state/draft";

// import { store } from "../../../../$store";

export function getSTComponents(nodeArray: any): React.ReactNode[] {
    // Convert to array
    if (!(nodeArray instanceof Array)) {
        nodeArray = [nodeArray];
    }

    const children: any = [];
    nodeArray.forEach((node: any) => {
        const ChildComp = (stComponents as any)[node.kind];
        if (!ChildComp) { return; }
        children.push(<ChildComp model={node} />);
    });

    return children;
}

export function getSTComponent(node: any): React.ReactElement {
    const ChildComp = (stComponents as any)[node.kind];
    if (!ChildComp) { return <></>; }
    return <ChildComp model={node} />;
}

export function getDraftComponent(viewState: BlockViewState, state: any, insertComponentStart: (position: DraftInsertPosition) => void): React.ReactNode[] {

    const targetPosition: DraftInsertPosition = viewState.draft[1]?.targetPosition;
    if (targetPosition &&
        (targetPosition.column !== state.targetPosition?.column || targetPosition.line !== state.targetPosition?.line)) {
        insertComponentStart(targetPosition);
    }
    const draft: [number, DraftStatementViewState] = viewState.draft;
    const draftComponents: React.ReactNode[] = [];
    switch (draft[1].type) {
        case "APIS":
            draftComponents.push(<ConnectorClient model={null} blockViewState={viewState} />);
            break;
        case "STATEMENT":
            switch (draft[1].subType) {
                case "If":
                    draftComponents.push(<IfElse model={null} blockViewState={viewState} />);
                    break;
                case "ForEach":
                    // FIXME: Reusing existing implementation of IfElse to add both If/Foreach
                    // We should refactor it to use Foreach component for the latter.
                    draftComponents.push(<IfElse model={null} blockViewState={viewState} />);
                    break;
                case "Log":
                    draftComponents.push(<DataProcessor model={null} blockViewState={viewState} />);
                    break;
                case "Variable":
                    draftComponents.push(<DataProcessor model={null} blockViewState={viewState} />);
                    break;
                case "Respond":
                    draftComponents.push(<Respond blockViewState={viewState} />);
                    break;
                case "Return":
                    draftComponents.push(<Respond blockViewState={viewState} />);
                    break;
            }
        default:
            break;
    }

    return draftComponents;
}
