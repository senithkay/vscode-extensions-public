/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { ComponentModel, CMEntity as Entity, Type } from '@wso2-enterprise/ballerina-core';
import { DiagramModel } from '@projectstorm/react-diagrams';
import { EntityLinkModel, EntityModel, EntityPortModel } from '../../components/entity-relationship';

function createEntityNodes(components: Type[], selectedEntityId?: string): Map<string, EntityModel> {
    let entityNodes = new Map<string, EntityModel>();

    const createNode = (component: Type) => {
        const node = new EntityModel(component.name, component);
        if (selectedEntityId && component.name === selectedEntityId) {
            node.isRootEntity = true;
        }
        entityNodes.set(component.name, node);
    };

    components.forEach(createNode);
    return entityNodes;
}

function createEntityLinks(entityNodes: Map<string, EntityModel>): EntityLinkModel[] {
    let entityLinks: EntityLinkModel[] = [];

    entityNodes.forEach((sourceNode) => {
        Object.entries(sourceNode.entityObject.members).forEach(([attributeName, member]) => {
            if (member.refs && member.refs.length > 0) {
                member.refs.forEach((ref) => {
                    const targetNode = entityNodes.get(ref);
                    if (targetNode) {
                        let sourcePort = sourceNode.getPort(`right-${sourceNode.getID()}/${attributeName}`);
                        let targetPort = targetNode.getPort(`left-${ref}`);

                        const linkId = `entity-link-${sourceNode.getID()}-${ref}`;
                        let link = new EntityLinkModel({ associate: "1", self: "1" }, linkId);
                        entityLinks.push(createLinks(sourcePort, targetPort, link));
                    }
                });
            }
        });
    });

    return entityLinks;
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

    Object.values(component.members).forEach(member => {
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

function generateNodes(entities: Map<string, Entity>): Map<string, EntityModel> {
    let nodes: Map<string, EntityModel> = new Map<string, EntityModel>();

    entities.forEach((entity, key) => {
        // @ts-ignore
        const entityNode = new EntityModel(key, entity);
        nodes.set(key, entityNode);
    });

    return nodes;
}

function generateLinks(entities: Map<string, Entity>, nodes: Map<string, EntityModel>): EntityLinkModel[] {
    let links: EntityLinkModel[] = [];

    entities.forEach((entity, key) => {
        let callingEntity: EntityModel = nodes.get(key);
        let associatedEntity: EntityModel;
        const callingDisplayName = callingEntity?.getID()?.slice(callingEntity?.getID()?.lastIndexOf(':') + 1);

        entity.attributes.forEach(attribute => {
            attribute.associations.forEach(association => {
                associatedEntity = nodes.get(association.associate);
                const assorciatedDisplayName = associatedEntity?.getID()?.slice(associatedEntity?.getID()?.lastIndexOf(':') + 1);
                if (callingEntity && associatedEntity) {
                    let sourcePort: EntityPortModel = callingEntity.getPort(`right-${key}/${attribute.name}`);
                    let targetPort: EntityPortModel = associatedEntity.getPort(`left-${association.associate}`);

                    if (sourcePort && targetPort) {
                        let link: EntityLinkModel = new EntityLinkModel(association.cardinality, `entity-link-${callingDisplayName}-${assorciatedDisplayName}`);
                        links.push(createLinks(sourcePort, targetPort, link));
                    }
                }
            });
        });

        entity.inclusions.forEach((inclusion) => {
            associatedEntity = nodes.get(inclusion);
            if (callingEntity && associatedEntity) {
                let sourcePort: EntityPortModel = callingEntity.getPort(`top-${key}`);
                let targetPort: EntityPortModel = associatedEntity.getPort(`bottom-${inclusion}`);

                if (sourcePort && targetPort) {
                    let link: EntityLinkModel = new EntityLinkModel(undefined);
                    links.push(createLinks(sourcePort, targetPort, link));
                }
            }
        })
    });

    return links;
}

function createLinks(sourcePort: EntityPortModel, targetPort: EntityPortModel, link: EntityLinkModel): EntityLinkModel {
    link.setSourcePort(sourcePort);
    link.setTargetPort(targetPort);
    sourcePort.addLink(link);
    return link;
}

let filteredEntities: Map<string, Entity>;
let wsComponents: Map<string, ComponentModel>;

export function generateCompositionModel(projectComponents: Map<string, ComponentModel>, entityID: string): DiagramModel {
    filteredEntities = new Map<string, Entity>();
    wsComponents = projectComponents;

    getRelatedEntities(entityID);
    let entityNodes: Map<string, EntityModel> = generateNodes(filteredEntities);
    // set rootnode property for UI contrast
    entityNodes.get(entityID).isRootEntity = true;

    let entityLinks: EntityLinkModel[] = generateLinks(filteredEntities, entityNodes);

    let model = new DiagramModel();
    model.addAll(...Array.from(entityNodes.values()), ...entityLinks);
    return model;
}

function getRelatedEntities(entityID: string) {
    if (!filteredEntities.has(entityID)) {
        let packageName: string = getPackageName(entityID);

        if (wsComponents.has(packageName)) {
            let packageEntities: Map<string, Entity> = new Map(Object.entries(wsComponents.get(packageName).entities));
            if (packageEntities.has(entityID)) {
                let entity: Entity = packageEntities.get(entityID);
                filteredEntities.set(entityID, entity);

                entity.attributes.map((attribute) => {
                    attribute.associations.map((association) => {
                        getRelatedEntities(association.associate);
                    })
                })

                entity.inclusions.map((inclusion) => {
                    getRelatedEntities(inclusion);
                })
            }
        }
    }
}

function getPackageName(entityID: string): string {
    // removes record type name from the entity ID to give package name
    let packageName: string = entityID.slice(0, entityID.lastIndexOf(':'));

    // if the entityID includes a module name, the package name should be removed
    if (packageName.split(':').length === 3) {
        let nameComponents: string[] = packageName.split(':');
        packageName = nameComponents[0] + ':' + nameComponents[2];
    }
    return packageName;
}
