/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Type, TypeNodeKind } from '@wso2-enterprise/ballerina-core';
import { DiagramModel } from '@projectstorm/react-diagrams';
import { EntityLinkModel, EntityModel, EntityPortModel } from '../../components/entity-relationship';

function createEntityNodes(components: Type[], selectedEntityId?: string, isGraphqlRoot?: boolean): Map<string, EntityModel> {
    let entityNodes = new Map<string, EntityModel>();

    const createNode = (component: Type) => {
        const node = new EntityModel(component.name, component);
        if (selectedEntityId && component.name === selectedEntityId) {
            node.isRootEntity = true;
        }
        if(isGraphqlRoot) {
            node.isGraphqlRoot = true;
        }

        entityNodes.set(component.name, node);
    };

    components.forEach(createNode);
    return entityNodes;
}

function createEntityLinks(entityNodes: Map<string, EntityModel>): EntityLinkModel[] {
    let entityLinks: EntityLinkModel[] = [];

    entityNodes.forEach((sourceNode) => {
        const members = isNodeClass(sourceNode.entityObject?.codedata?.node ) ? sourceNode.entityObject.functions : sourceNode.entityObject.members; // Use functions if it's a CLASS

        Object.entries(members).forEach(([_, member]) => {
            if (member.refs && member.refs.length > 0) {
                member.refs.forEach((ref) => {
                    const targetNode = entityNodes.get(ref);
                    if (targetNode) {
                        let sourcePort = sourceNode.getPort(`right-${sourceNode.getID()}/${member.name}`);
                        let targetPort = targetNode.getPort(`left-${ref}`);

                        const linkId = `entity-link-${sourceNode.getID()}-${ref}`;
                        let link = new EntityLinkModel({ associate: "1", self: "1" }, linkId); // REMOVE cardinalities
                        entityLinks.push(createLinks(sourcePort, targetPort, link));
                    }
                });
            }
        });
    });

    return entityLinks;
}

export function isNodeClass(nodeKind: TypeNodeKind): boolean {
    return nodeKind === 'CLASS' || nodeKind === 'SERVICE_DECLARATION';
}

export function graphqlModeller(rootService: Type, refs: Type[]): DiagramModel {
    const rootNode  = createEntityNodes([rootService], undefined, true);
    console.log("rootNode", rootNode);
    const entityNodes = createEntityNodes(refs);
    console.log("entityNodes", entityNodes);
    const allNodes = new Map([...rootNode, ...entityNodes]);
    const entityLinks = createEntityLinks(allNodes);
    let model = new DiagramModel();
    model.addAll(...Array.from(allNodes.values()), ...entityLinks);
    return model;
}

export function entityModeller(components: Type[], selectedEntityId?: string): DiagramModel {
    let filteredComponents = components;

    // If selectedEntityId is provided, filter for related entities
    if (selectedEntityId) {
        const relatedEntities = new Set<string>();
        relatedEntities.add(selectedEntityId);
        findRelatedEntities(selectedEntityId, components, relatedEntities);
        filteredComponents = components.filter(comp => relatedEntities.has(comp.name));
    }

    // Create nodes and links
    const entityNodes = createEntityNodes(filteredComponents, selectedEntityId);
    const entityLinks = createEntityLinks(entityNodes);

    let model = new DiagramModel();
    model.addAll(...Array.from(entityNodes.values()), ...entityLinks);
    return model;
}

function findRelatedEntities(componentId: string, components: Type[], relatedEntities: Set<string>) {
    const component = components.find(comp => comp.name === componentId);
    if (!component) return;

    const members = isNodeClass(component?.codedata?.node) ? component.functions : component.members;
    
    Object.values(members).forEach(member => {
        if (member.refs) {
            member.refs.forEach(ref => {
                if (!relatedEntities.has(ref)) {
                    relatedEntities.add(ref);
                    findRelatedEntities(ref, components, relatedEntities);
                }
            });
        }
    });
}

function createLinks(sourcePort: EntityPortModel, targetPort: EntityPortModel, link: EntityLinkModel): EntityLinkModel {
    link.setSourcePort(sourcePort);
    link.setTargetPort(targetPort);
    sourcePort.addLink(link);
    return link;
}

