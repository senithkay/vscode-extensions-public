/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

/** @jsxImportSource @emotion/react */
import { css, keyframes } from "@emotion/react";
import { useState } from "react";
import { DiagramEngine } from "@projectstorm/react-diagrams";
import { NodeLinkModel } from "./NodeLinkModel";
import { Colors } from "../../resources/constants";
import { useDiagramContext } from "../DiagramContext";
import { BaseNodeModel } from "../nodes/BaseNode";
import { LineRange, LinePosition, FlowNode } from "../../utils/types";
import { EmptyNodeModel } from "../nodes/EmptyNode";

interface NodeLinkWidgetProps {
    link: NodeLinkModel;
    engine: DiagramEngine;
}

const fadeInZoomIn = keyframes`
    0% {
        opacity: 0;
        transform: scale(0.5);
    }
    100% {
        opacity: 1;
        transform: scale(1);
    }
`;

export const NodeLinkWidget: React.FC<NodeLinkWidgetProps> = ({ link, engine }) => {
    const [isHovered, setIsHovered] = useState(false);
    const { flow, showErrorFlow, onAddNode } = useDiagramContext();

    const linkColor = isHovered ? Colors.PRIMARY : Colors.ON_SURFACE;

    const addButtonPosition = link.getAddButtonPosition();

    const handleAddNode = () => {
        const sourceNode = link.sourceNode as BaseNodeModel;
        let node = sourceNode.node;

        const hackGap = 1; //HACK: hack to add node at the end of the line. need to fix with LS extension

        // handle top node
        if (node && node.codedata.node === "EVENT_HTTP_API") {
            const doBlock = flow.nodes.find((node) => node.codedata.node === "ERROR_HANDLER");
            if (doBlock) {
                const branchLabel = showErrorFlow ? "On Fail" : "Body";
                const activeDoBranch = doBlock.branches.find((branch) => branch.label === branchLabel);
                if (activeDoBranch) {
                    const targetPosition: LinePosition = {
                        line: activeDoBranch.codedata.lineRange.startLine.line,
                        offset: activeDoBranch.codedata.lineRange.startLine.offset + hackGap,
                    };
                    const target: LineRange = {
                        startLine: targetPosition,
                        endLine: targetPosition,
                    };
                    onAddNode(doBlock, target);
                    return;
                }
            } else {
                console.log(">>> ERROR: do block not found");
                // fix this flow
            }
        }
        // handle IF node
        if (!sourceNode.node && sourceNode instanceof EmptyNodeModel) {
            // handle if node end-if button
            node = (sourceNode as unknown as EmptyNodeModel).getParentFlowNode();
        }
        if (node.codedata.node === "IF") {
            const activeBranch = node.branches.find((branch) => branch.label === link.label);
            if (activeBranch) {
                const targetPosition: LinePosition = {
                    line: activeBranch.codedata.lineRange.startLine.line,
                    offset: activeBranch.codedata.lineRange.startLine.offset + hackGap,
                };
                if (link.label === "Else") {
                    targetPosition.offset += 5; //HACK: need to fix with LS extension
                }
                const target: LineRange = {
                    startLine: targetPosition,
                    endLine: targetPosition,
                };
                onAddNode(node, target);
                return;
            } else {
                console.log(">>> ERROR: active branch not found");
                // fix this flow
            }
        }

        if (node) {
            const target: LineRange = {
                startLine: node.codedata.lineRange.endLine,
                endLine: node.codedata.lineRange.endLine,
            };
            onAddNode(node, target);
        }
    };

    return (
        <g pointerEvents={"all"} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <path
                id={link.getID() + "-bg"}
                d={link.getSVGPath()}
                fill={"none"}
                stroke={"transparent"}
                strokeWidth={16}
            />
            <path
                id={link.getID()}
                d={link.getSVGPath()}
                fill={"none"}
                stroke={link.showAddButton && linkColor}
                strokeWidth={1.5}
                strokeDasharray={link.brokenLine ? "5,5" : "0"}
                markerEnd={link.showArrowToNode() ? `url(#${link.getID()}-arrow-head)` : ""}
            />
            {link.label && (
                <foreignObject x={addButtonPosition.x - 50} y={addButtonPosition.y - 10} width="100" height="100">
                    <div
                        css={css`
                            display: ${isHovered ? "none" : "flex"};
                            justify-content: center;
                            align-items: center;
                            animation: ${fadeInZoomIn} 0.2s ease-out forwards;
                        `}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                borderRadius: "20px",
                                border: `1.5px solid ${link.showAddButton && linkColor}`,
                                backgroundColor: `${Colors.SURFACE_BRIGHT}`,
                                padding: "2px 10px",
                                boxSizing: "border-box",
                                width: "fit-content",
                            }}
                        >
                            <span
                                style={{
                                    color: link.showAddButton && linkColor,
                                    fontSize: "14px",
                                    userSelect: "none",
                                }}
                            >
                                {link.label}
                            </span>
                        </div>
                    </div>
                </foreignObject>
            )}
            {link.showAddButton && (
                <foreignObject
                    x={addButtonPosition.x - 10}
                    y={addButtonPosition.y - 10}
                    width="20"
                    height="20"
                    onClick={handleAddNode}
                >
                    <div
                        css={css`
                            display: ${isHovered ? "flex" : "none"};
                            justify-content: center;
                            align-items: center;
                            cursor: pointer;
                            animation: ${fadeInZoomIn} 0.2s ease-out forwards;
                        `}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                            <path
                                fill={Colors.SURFACE_BRIGHT}
                                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
                            />
                            <path
                                fill={Colors.PRIMARY}
                                d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2m0 18a8 8 0 1 1 8-8a8 8 0 0 1-8 8m4-9h-3V8a1 1 0 0 0-2 0v3H8a1 1 0 0 0 0 2h3v3a1 1 0 0 0 2 0v-3h3a1 1 0 0 0 0-2"
                            />
                        </svg>
                    </div>
                </foreignObject>
            )}
            <defs>
                <marker
                    markerWidth="4"
                    markerHeight="4"
                    refX="3"
                    refY="2"
                    viewBox="0 0 4 4"
                    orient="auto"
                    id={`${link.getID()}-arrow-head`}
                >
                    <polygon points="0,4 0,0 4,2" fill={link.showAddButton && linkColor}></polygon>
                </marker>
            </defs>
        </g>
    );
};
