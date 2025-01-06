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

export function entityModeller(compoenets: Type[])
    : DiagramModel {
    let entityNodes: Map<string, EntityModel> = new Map<string, EntityModel>();
    let entityLinks: EntityLinkModel[] = [];

    // Iterate through components and create entity nodes
    compoenets.forEach((component) => {
        const entityNode = new EntityModel(component.name, component);
        entityNodes.set(component.name, entityNode);
    });

    // Iterate through the entity relationships and create links
    entityNodes.forEach((entityNode) => {
        Object.entries(entityNode.entityObject.members).forEach(([attributeName, member]) => {
            if (member.refs && member.refs.length > 0) {
                // Iterate refs and create links
                member.refs.forEach((ref) => {
                    const associatedEntity = entityNodes.get(ref);
                    if (associatedEntity) {
                        let sourcePort: EntityPortModel = entityNode.getPort(`right-${entityNode.getID()}/${attributeName}`);
                        let targetPort: EntityPortModel = associatedEntity.getPort(`left-${ref}`);

                        const linkId = `entity-link-${entityNode.getID()}-${ref}`
                        let link: EntityLinkModel = new EntityLinkModel({ associate: "1", self: "1" }, linkId);
                        entityLinks.push(createLinks(sourcePort, targetPort, link));
                    }
                });
            }
        });
    });

    let model = new DiagramModel();
    model.addAll(...Array.from(entityNodes.values()), ...entityLinks);
    return model;
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
