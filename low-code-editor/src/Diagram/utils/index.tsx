import React from "react";

import { NodePosition } from "@ballerina/syntax-tree";

import * as stComponents from '../components/LowCodeDiagram';
import { ActionProcessor } from "../components/LowCodeDiagram/ActionInvocation/ActionProcess";
import { ConnectorProcess } from "../components/LowCodeDiagram/Connector/ConnectorProcess";
import { IfElse } from "../components/LowCodeDiagram/IfElse";
import { DataProcessor } from "../components/LowCodeDiagram/Processor";
import { Respond } from "../components/LowCodeDiagram/Respond";
import { Statement } from "../components/LowCodeDiagram/Statement";
import { BlockViewState } from "../view-state";
import { DraftStatementViewState } from "../view-state/draft";

export function getSTComponents(nodeArray: any): React.ReactNode[] {
    // Convert to array
    if (!(nodeArray instanceof Array)) {
        nodeArray = [nodeArray];
    }

    const children: any = [];
    nodeArray.forEach((node: any) => {
        const ChildComp = (stComponents as any)[node.kind];
        if (!ChildComp) {
            children.push(<Statement model={node} />);
        } else {
            children.push(<ChildComp model={node} />);
        }
    });

    return children;
}

export function getSTComponent(node: any): React.ReactElement {
    const ChildComp = (stComponents as any)[node.kind];
    if (!ChildComp) {
        return <Statement model={node} />;
    }
    return <ChildComp model={node} />;
}

export function getDraftComponent(viewState: BlockViewState, state: any, insertComponentStart: (position: NodePosition) => void): React.ReactNode[] {

    const targetPosition: NodePosition = viewState.draft[1]?.targetPosition;
    if (targetPosition &&
        (targetPosition.startColumn !== state.targetPosition?.startColumn || targetPosition.startLine !== state.targetPosition?.startLine)) {
        insertComponentStart(targetPosition);
    }
    const draft: [number, DraftStatementViewState] = viewState.draft;
    const draftComponents: React.ReactNode[] = [];
    switch (draft[1].type) {
        case "APIS":
            switch (draft[1].subType) {
                case "New":
                    draftComponents.push(<ConnectorProcess model={null} blockViewState={viewState} />);
                    break;
                case "Existing":
                    draftComponents.push(<ActionProcessor model={null} blockViewState={viewState} />);
                    break;
                default:
                    break;
            }
            break;
        case "STATEMENT":
            switch (draft[1].subType) {
                case "If":
                case "ForEach":
                // FIXME: Reusing existing implementation of IfElse to add both If/Foreach
                // We should refactor it to use Foreach component for the latter.
                case "While":
                    draftComponents.push(<IfElse model={null} blockViewState={viewState} />);
                    break;
                case "Log":
                    draftComponents.push(<DataProcessor model={null} blockViewState={viewState} />);
                    break;
                case "Variable":
                    draftComponents.push(<DataProcessor model={null} blockViewState={viewState} />);
                    break;
                case "DataMapper":
                    draftComponents.push(<DataProcessor model={null} blockViewState={viewState} />);
                    break;
                case "Custom":
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
