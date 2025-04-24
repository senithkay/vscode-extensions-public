/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useState } from "react";
import { AllNodeModel } from "../../utils/diagram";
import { Codicon, TextField, TreeView, TreeViewItem } from "@wso2-enterprise/ui-toolkit";
import { StartNodeModel } from "../nodes/StartNode/StartNodeModel";
import { EmptyNodeModel } from "../nodes/EmptyNode/EmptyNodeModel";
import { EndNodeModel } from "../nodes/EndNode/EndNodeModel";
import { getNodeDescription } from "../../utils/node";
import { Connector, STNode, Tool } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import { ConditionNodeModel } from "../nodes/ConditionNode/ConditionNodeModel";
import { NodeLinkModel } from "../NodeLink/NodeLinkModel";
import { MediatorNodeModel } from "../nodes/MediatorNode/MediatorNodeModel";
import { debounce } from "lodash";
import { getMediatorIconsFromFont } from "../../resources/icons/mediatorIcons/icons";
import { useVisualizerContext } from "@wso2-enterprise/mi-rpc-client";
import SidePanelContext from "../sidePanel/SidePanelContexProvider";
import { ConnectorIcons } from "../Diagram";
import { FirstCharToUpperCase } from "../../utils/commons";

const SearchStyle = {
    marginLeft: '10px',
    marginBottom: '10px',
    marginTop: '10px',
    width: '270px',

    '& > vscode-text-field': {
        width: '100%',
        borderRadius: '5px',
    },
};

const searchIcon = (<Codicon name="search" sx={{ cursor: "auto" }} />);

export interface NavigatorProps {
    nodes: AllNodeModel[];
    links: NodeLinkModel[];
    documentUri: string;
    centerNode?: (node: MediatorNodeModel | NodeLinkModel) => Promise<void>;
    connectorIcons: ConnectorIcons;
}
interface GenerateTreeProps {
    nodes: AllNodeModel[];
    centerNode: any
}
export function Navigator(props: NavigatorProps) {
    const { links, connectorIcons } = props;
    const [searchTerm, setSearchTerm] = useState('');
    const { rpcClient, setIsLoading: setDiagramLoading } = useVisualizerContext();
    const sidePanelContext = React.useContext(SidePanelContext);

    const editNode = async (e: any, node: any) => {
        await node.onClicked(e, node, rpcClient, sidePanelContext)
    }

    const deleteNode = async (node: STNode) => {
        setDiagramLoading(true);
        rpcClient.getMiDiagramRpcClient().applyEdit({
            documentUri: props.documentUri,
            range: {
                start: node.spaces.startingTagSpace.leadingSpace.range.start,
                end: node?.range?.endTagRange?.end ?? node.range.startTagRange.end
            },
            text: "",
            disableFormatting: true
        });
    }

    function GenerateTree(props: GenerateTreeProps) {

        // Depth-first search to find nodes matching search term
        const dfs = (node: any): boolean => {
            if (node instanceof StartNodeModel || node instanceof EndNodeModel || node instanceof EmptyNodeModel) {
                return false;
            }
            // Check if current node matches search term
            const nodeName = node.mediatorName || '';
            const nodeDescription = getNodeDescription(node.stNode) || '';
            const matchesSearch = nodeName.toLowerCase().includes(searchTerm.toLowerCase())
                || nodeDescription.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase());

            let hasMatchingChildren = false;

            // Check condition node branches
            if (node instanceof ConditionNodeModel) {
                const branches = (node as any).branches;
                if (branches) {
                    Object.entries(branches).forEach(([key, childNodes]) => {
                        const branchNodes = childNodes as AllNodeModel[];
                        const filteredBranchNodes = branchNodes.filter(dfs);
                        if (filteredBranchNodes.length > 0) {
                            hasMatchingChildren = true;
                        }
                    });
                }
            }

            // Check regular children
            const children = (node as any).childrens;
            if (children) {
                const hasMatches = children.some(dfs);
                if (hasMatches) {
                    hasMatchingChildren = true;
                }
            }

            return matchesSearch || hasMatchingChildren;
        };

        // Filter nodes based on search term if it exists
        const filterNodesBySearchTerm = (nodes: AllNodeModel[]): AllNodeModel[] => {
            if (!searchTerm) return nodes;

            // Apply DFS to each root node
            return nodes.filter(dfs);
        };

        function onClick(node: any, branch?: string) {
            if (branch) {
                const link = links.filter((link) => link.sourceNode === node && link.label === branch);
                if (link) {
                    props.centerNode(link[0]);
                }
            } else {
                props.centerNode(node);
            }
        }

        // Search nodes
        const filteredNodes = filterNodesBySearchTerm(props.nodes);

        return <>
            {filteredNodes.map((node: AllNodeModel) => {
                // Skip certain node types
                if (node instanceof StartNodeModel || node instanceof EndNodeModel || node instanceof EmptyNodeModel) {
                    return undefined;
                }

                // Get mediator node for display
                const mediatorNode = ((node.stNode as Tool).mediator ?? node.stNode) as STNode;
                const fullContent = `${node.mediatorName}`;
                const maxLength = 50;
                let nodeContent = fullContent.length > maxLength
                    ? `${fullContent.substring(0, maxLength)}...`
                    : fullContent;
                let nodeIcon = getMediatorIconsFromFont(mediatorNode.tag);

                if (node.stNode.tag.includes('.')) {
                    nodeIcon = <div style={{ width: '25px', height: '25px'}}><img src={connectorIcons[node.stNode.connectorName].connectorIcon} alt="Icon" /></div>;
                    const operation = (((node.stNode as Tool).mediator ?? node.stNode) as Connector).method;
                    nodeContent = FirstCharToUpperCase(operation);
                }

                const nodeId = (node as any).id;
                const childNodes = (node as any).childrens;

                if (node instanceof ConditionNodeModel) {
                    const nodeBranches = (node as any).branches;
                    return (
                        <TreeView
                            key={nodeId}
                            id={nodeId}
                            content={nodeContent}
                            sx={{ backgroundColor: 'transparent' }}
                            collapseByDefault={!searchTerm}
                            onSelect={() => onClick(node)}
                            onDelete={() => {
                                deleteNode(node.stNode)
                            }}
                            onEdit={(e: any) => {
                                editNode(e, node)
                            }}
                        >
                            {nodeBranches && Object.entries(nodeBranches).map(([key, childNodes]) => {
                                if (searchTerm) {
                                    const filteredBranchNodes = (childNodes as AllNodeModel[]).filter(dfs);
                                    if (filteredBranchNodes.length === 0) {
                                        return;
                                    }
                                }
                                return (
                                    <TreeView
                                        key={`${nodeId}-${key}`}
                                        id={`${nodeId}-${key}`}
                                        content={key}
                                        sx={{ backgroundColor: 'transparent' }}
                                        collapseByDefault={!searchTerm}
                                        onSelect={() => onClick(node, key)}
                                    >
                                        <div style={{ paddingLeft: '10px' }}>
                                            {/* {treeItems} */}
                                            <GenerateTree nodes={childNodes as any} centerNode={props.centerNode} />
                                        </div>
                                    </TreeView>
                                );
                            })}
                        </TreeView>
                    );
                } else if (childNodes) {
                    return (
                        <TreeView
                            key={nodeId}
                            id={nodeId}
                            content={nodeContent}
                            sx={{ backgroundColor: 'transparent' }}
                            collapseByDefault={!searchTerm}
                            onSelect={() => onClick(node)}
                        >
                            <div style={{ paddingLeft: '10px' }}>
                                <GenerateTree nodes={childNodes as any} centerNode={props.centerNode} />
                            </div>
                        </TreeView>
                    );
                } else {
                    return (
                        <TreeViewItem
                            key={nodeId}
                            id={nodeId}
                            sx={{ backgroundColor: 'transparent' }}
                            onSelect={() => {
                                onClick(node)

                            }}
                            onDelete={() => {
                                deleteNode(node.stNode)
                            }}
                            onEdit={(e: any) => {
                                editNode(e, node)
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', transform: 'scale(0.6)' }}>{nodeIcon}</div>
                                <div>{nodeContent}</div>
                            </div>
                        </TreeViewItem>
                    );
                }
            })}
        </>
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ margin: '7px 0px 7px 11px', fontSize: '15px', fontWeight: 'bold' }}>Navigator</span>
            <div
                style={{
                    textAlign: 'left',
                    display: 'flex',
                    width: '280px',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    paddingBottom: '20px'
                }}
            >
                <TextField
                    sx={SearchStyle}
                    placeholder="Search"
                    value={searchTerm}
                    onTextChange={React.useMemo(
                        () => debounce((value: string) => {
                            setSearchTerm(value);
                        }, 300),
                        []
                    )}
                    icon={{
                        iconComponent: searchIcon,
                        position: 'start',
                    }}
                    autoFocus={true}
                />
                <div
                    style={{
                        textAlign: 'left',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        maxHeight: '450px',
                        width: '100%',
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        scrollbarWidth: 'thin',
                        msOverflowStyle: 'auto',
                        wordBreak: 'break-word',
                        boxSizing: 'border-box',
                    }}
                >
                    {<GenerateTree nodes={props.nodes} centerNode={props.centerNode} />}
                </div>
            </div>
        </div>
    )
}