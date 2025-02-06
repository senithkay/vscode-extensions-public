/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React, { useContext, useEffect, useState } from 'react';
import { DiagramEngine } from '@projectstorm/react-diagrams';

import { EntityModel } from './EntityModel';
import { EntityLinkModel } from '../EntityLink/EntityLinkModel';
import { EntityPortWidget } from '../EntityPort/EntityPortWidget';
import { EntityHeadWidget } from './EntityHead/EntityHead';
import { AttributeWidget } from './Attribute/AttributeCard';
import { EntityNode, InclusionPortsContainer, OperationSection } from './styles';
import { DiagramContext } from '../../common';
import styled from '@emotion/styled';
import { ThemeColors } from '@wso2-enterprise/ui-toolkit';
import { isNodeClass } from '../../../utils/model-mapper/entityModelMapper';


export const AttributeHeader: React.FC<any> = styled.span`
    align-items: center;
    color: ${ThemeColors.ON_SURFACE};
    display: flex;
    flex: 1;
    font-family: GilmerMedium;
    font-size: 12px;
    line-height: 30px;
    padding-left: 8px;
    text-align: left;
`;


interface EntityWidgetProps {
    node: EntityModel;
    engine: DiagramEngine;
}

export function EntityWidget(props: EntityWidgetProps) {
    const { node, engine } = props;
    const { focusedNodeId, selectedNodeId } = useContext(DiagramContext);
    const [selectedLink, setSelectedLink] = useState<EntityLinkModel>(undefined);

    const renderAttributes = () => {
        if (node.isGraphqlRoot) {

            const attributes: React.ReactNode[] = [];
            // const [collapsedSections, setCollapsedSections] = useState({
            //     query: false,
            //     mutation: false,
            //     subscription: false,
            // });

            // const toggleSection = (section: string) => {
            //     setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
            // };

            const categorizedFunctions = {
                query: [],
                mutation: [],
                subscription: [],
            };

            node.entityObject.functions.forEach((func: any) => {
                if (func.kind === 'RESOURCE') {
                    if (func.accessor === 'subscribe') {
                        categorizedFunctions.subscription.push(func);
                    } else {
                        categorizedFunctions.query.push(func);
                    }
                } else if (func.kind === 'REMOTE') {
                    categorizedFunctions.mutation.push(func);
                }
            });

            // Render Query section
            if (categorizedFunctions.query.length > 0) {
                attributes.push(
                    <div key="query-section">
                        <OperationSection>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                            {/* <Codicon name={collapsedSections.query ? "chevron-up" : "chevron-down"} onClick={() => toggleSection('query')} /> */}
                            <AttributeHeader>Query</AttributeHeader>
                        </div>
                        {/* <h3 onClick={() => toggleSection('query')}>Query</h3> */}
                        {/* {!collapsedSections.query && ( */}
                            <div>
                                {categorizedFunctions.query.map((query: any) => (
                                    <AttributeWidget
                                        engine={engine}
                                        node={node}
                                        attribute={query}
                                        isSelected={node.isNodeSelected(selectedLink, `${node.getID()}/${query.name}`)}
                                    />
                                    // <div key={query.name}>{query.name}</div>
                                ))}
                            </div>
                        {/* )} */}
                        </OperationSection>
                    </div>
                );
            }

            // Render Mutation section
            if (categorizedFunctions.mutation.length > 0) {
                attributes.push(
                    <div key="mutation-section">
                        <OperationSection>
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                            {/* <Codicon name={collapsedSections.mutation ? "chevron-up" : "chevron-down"} onClick={() => toggleSection('mutation')} /> */}
                            <AttributeHeader>Mutation</AttributeHeader>
                        </div>
                        {/* {!collapsedSections.mutation && ( */}
                            <div>
                                {categorizedFunctions.mutation.map((mutation: any) => (
                                    <AttributeWidget
                                        engine={engine}
                                        node={node}
                                        attribute={mutation}
                                        isSelected={node.isNodeSelected(selectedLink, `${node.getID()}/${mutation.name}`)}
                                    />
                                ))}
                            </div>
                        {/* )} */}
                        </OperationSection>
                    </div>
                );
            }

            // Render Subscription section
            if (categorizedFunctions.subscription.length > 0) {
                attributes.push(
                    <div key="subscription-section">
                        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                            {/* <Codicon name={collapsedSections.subscription ? "chevron-up" : "chevron-down"} onClick={() => toggleSection('subscription')} /> */}
                            <AttributeHeader>Subscription</AttributeHeader>
                        </div>
                        {/* {!collapsedSections.subscription && ( */}
                            <div>
                                {categorizedFunctions.subscription.map((subscription: any) => (
                                    <AttributeWidget
                                        engine={engine}
                                        node={node}
                                        attribute={subscription}
                                        isSelected={node.isNodeSelected(selectedLink, `${node.getID()}/${subscription.name}`)}
                                    />))}
                            </div>
                        {/* )} */}
                    </div>
                );
            }

            return attributes;


        } else {
            const attributes: React.ReactNode[] = [];
            const members = isNodeClass(node.entityObject?.codedata?.node) ? node.entityObject.functions : node.entityObject.members; // Use functions if it's a CLASS
            if (members) {
                Object.entries(members).forEach(([key, member]) => (
                    attributes.push(
                        <AttributeWidget
                            key={key}
                            engine={engine}
                            node={node}
                            attribute={member}
                            isSelected={node.isNodeSelected(selectedLink, `${node.getID()}/${member.name}`)}
                        />
                    )
                ));
            }

            return attributes;
        }
    };

    useEffect(() => {
        node.registerListener({
            'SELECT': (event: any) => {
                setSelectedLink(event.entity as EntityLinkModel);
            },
            'UNSELECT': () => { setSelectedLink(undefined) }
        })
    }, [node])

    return (
        <>
            {node.getID() &&
                <EntityNode
                    isAnonymous={false}
                    isEditMode={false}
                    isSelected={node.isNodeSelected(selectedLink, node.getID()) || selectedNodeId === node.getID()}
                    shouldShade={false}
                    isFocused={node.getID() === focusedNodeId}
                >
                    <EntityHeadWidget
                        engine={engine}
                        node={node}
                        isSelected={node.isNodeSelected(selectedLink, node.getID()) || selectedNodeId === node.getID()}
                    />

                    {renderAttributes()}

                    <InclusionPortsContainer>
                        <EntityPortWidget
                            port={node.getPort(`top-${node.getID()}`)}
                            engine={engine}
                        />
                        <EntityPortWidget
                            port={node.getPort(`bottom-${node.getID()}`)}
                            engine={engine}
                        />
                    </InclusionPortsContainer>
                </EntityNode>
            }
        </>
    );
}
