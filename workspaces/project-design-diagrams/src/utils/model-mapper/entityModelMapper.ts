/**
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import { ComponentModel, Entity } from '@wso2-enterprise/ballerina-languageclient';
import { DiagramModel } from '@projectstorm/react-diagrams';
import { EntityLinkModel, EntityModel, EntityPortModel } from '../../components/entity-relationship';

export function entityModeller(projectComponents: Map<string, ComponentModel>, packageSelection: Map<string, boolean>)
    : DiagramModel {
    let entityNodes: Map<string, EntityModel> = new Map<string, EntityModel>();
    let entityLinks: EntityLinkModel[] = [];

    // convert entities in the model to nodes
    packageSelection.forEach((shouldRender, packageName) => {
        if (shouldRender && projectComponents.has(packageName)) {
            const entities: Map<string, Entity> = new Map(Object.entries(projectComponents.get(packageName).entities));
            entityNodes = new Map([...entityNodes, ...generateNodes(entities)]);
        }
    });

    // convert the associations between entities to links
    packageSelection.forEach((shouldRender, packageName) => {
        if (shouldRender && projectComponents.has(packageName)) {
            const entities: Map<string, Entity> = new Map(Object.entries(projectComponents.get(packageName).entities));
            entityLinks = entityLinks.concat(generateLinks(entities, entityNodes));
        }
    });

    let model = new DiagramModel();
    model.addAll(...Array.from(entityNodes.values()), ...entityLinks);
    return model;
}

function generateNodes(entities: Map<string, Entity>): Map<string, EntityModel> {
    let nodes: Map<string, EntityModel> = new Map<string, EntityModel>();

    entities.forEach((entity, key) => {
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

        entity.attributes.forEach(attribute => {
            attribute.associations.forEach(association => {
                associatedEntity = nodes.get(association.associate);
                if (callingEntity && associatedEntity) {
                    let sourcePort: EntityPortModel = callingEntity.getPort(`right-${key}/${attribute.name}`);
                    let targetPort: EntityPortModel = associatedEntity.getPort(`left-${association.associate}`);

                    if (sourcePort && targetPort) {
                        let link: EntityLinkModel = new EntityLinkModel(association.cardinality);
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
