import React from "react";

import { IsolatedKeyword, NodePosition, PublicKeyword, STKindChecker, STNode, traversNode } from "@wso2-enterprise/syntax-tree";

import * as stComponents from '../Components/RenderingComponents';
import { ActionProcessor } from "../Components/RenderingComponents/ActionInvocation/ActionProcess";
import { ConnectorProcess } from "../Components/RenderingComponents/Connector/ConnectorProcess";
import { IfElse } from "../Components/RenderingComponents/IfElse";
import { DataProcessor } from "../Components/RenderingComponents/Processor";
import { Respond } from "../Components/RenderingComponents/Respond";
import { Statement } from "../Components/RenderingComponents/Statement";
import { BlockViewState, FunctionViewState } from "../ViewState";
import { DraftStatementViewState } from "../ViewState/draft";
import { visitor as initVisitor } from "../Visitors/init-visitor";
import { PositioningVisitor, visitor as positionVisitor } from "../Visitors/positioning-visitor";
import { SizingVisitor, visitor as sizingVisitor } from "../Visitors/sizing-visitor";

export function sizingAndPositioning(st: STNode, experimentalEnabled?: boolean): STNode {
    traversNode(st, initVisitor);
    traversNode(st, new SizingVisitor(experimentalEnabled));
    traversNode(st, new PositioningVisitor(experimentalEnabled));


    if (STKindChecker.isFunctionDefinition(st) && st?.viewState?.onFail) {
        const viewState = st.viewState as FunctionViewState;
        traversNode(viewState.onFail, new SizingVisitor(experimentalEnabled));
        traversNode(viewState.onFail, new PositioningVisitor(experimentalEnabled));
    }
    const clone = { ...st };
    return clone;
}

export function recalculateSizingAndPositioning(st: STNode, experimentalEnabled?: boolean): STNode {
    traversNode(st, new SizingVisitor(experimentalEnabled));
    traversNode(st, new PositioningVisitor(experimentalEnabled));
    if (STKindChecker.isFunctionDefinition(st) && st?.viewState?.onFail) {
        const viewState = st.viewState as FunctionViewState;
        traversNode(viewState.onFail, new SizingVisitor(experimentalEnabled));
        traversNode(viewState.onFail, new PositioningVisitor(experimentalEnabled));
    }
    const clone = { ...st };
    return clone;
}

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
                case "Custom":
                    draftComponents.push(<DataProcessor model={null} blockViewState={viewState} />);
                    break;
                case "HTTP":
                    draftComponents.push(
                        <ConnectorProcess model={null} specialConnectorName={"HTTP"} blockViewState={viewState} />
                    );
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

export function getNodeSignature(node: STNode): string {
    if (STKindChecker.isServiceDeclaration(node)) {
        let qualifiers = '';
        let path = '';

        node.qualifiers.forEach((qualifier: IsolatedKeyword | PublicKeyword, i: number) => {
            qualifiers += qualifier.value;

            if (i <= node.qualifiers.length - 1) {
                qualifiers += ' ';
            }
        });

        node.absoluteResourcePath.forEach((pathSegment, i) => {
            path += pathSegment.value;

            if (i === node.absoluteResourcePath.length - 1) {
                path += ' ';
            }
        });

        return `${qualifiers}service ${path}on ${node.expressions[0].source}`;

    } else if (STKindChecker.isResourceAccessorDefinition(node)) {
        let qualifiers = '';
        let path = '';

        node.qualifierList.forEach((qualifier: IsolatedKeyword | PublicKeyword, i: number) => {
            qualifiers += qualifier.value;

            if (i <= node.qualifierList.length - 1) {
                qualifiers += ' ';
            }
        });

        node.relativeResourcePath.forEach((pathSegment, i) => {
            path += pathSegment.value;
        });

        return `${qualifiers}function ${node.functionName.value} ${path}${node.functionSignature.source}`;
    } else if (STKindChecker.isFunctionDefinition(node)) {
        let qualifiers = '';
        const path = '';

        node.qualifierList.forEach((qualifier: IsolatedKeyword | PublicKeyword, i: number) => {
            qualifiers += qualifier.value;

            if (i <= node.qualifierList.length - 1) {
                qualifiers += ' ';
            }
        });

        return `${qualifiers}function ${node.functionName.value}${node.functionSignature.source}`;
    }

    return '';
}

export function getTargetPositionString(pos: NodePosition) {
    const { startLine, startColumn, endLine, endColumn } = pos;
    return `${startLine}.${startColumn}.${endLine}.${endColumn}`
}
