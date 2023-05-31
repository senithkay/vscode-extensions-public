/**
 * Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
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

import { CMEntity as Entity } from '@wso2-enterprise/ballerina-languageclient';
import { DiagramModel } from '@projectstorm/react-diagrams';
import { EntityLinkModel, EntityModel, EntityPortModel } from '../components';

export function entityModeller(entities: Map<string, Entity>): DiagramModel {
    let entityNodes: Map<string, EntityModel> = generateNodes(entities);
    let entityLinks: Map<string, EntityLinkModel> = generateLinks(entities, entityNodes);

    let model = new DiagramModel();
    model.addAll(...Array.from(entityNodes.values()), ...Array.from(entityLinks.values()));
    return model;
}

function generateNodes(entities: Map<string, Entity>): Map<string, EntityModel> {
    let nodes: Map<string, EntityModel> = new Map<string, EntityModel>();
    entities?.forEach((entity, key) => {
        const entityNode = new EntityModel(key, entity);
        nodes.set(key, entityNode);
    });

    return nodes;
}

function generateLinks(entities: Map<string, Entity>, nodes: Map<string, EntityModel>): Map<string, EntityLinkModel> {
    let links: Map<string, EntityLinkModel> = new Map();
    let mappedLinkNodes: Map<string, string[]> = new Map();

    entities?.forEach((entity, key) => {
        let callingEntity: EntityModel = nodes.get(key);
        let associatedEntity: EntityModel;

        if (!mappedLinkNodes.has(key)) {
            mappedLinkNodes.set(key, []);
        }

        entity.attributes.forEach(attribute => {
            attribute.associations.forEach(association => {
                associatedEntity = nodes.get(association.associate);
                if (callingEntity && associatedEntity) {
                    let sourcePort: EntityPortModel = callingEntity.getPort(`right-${key}/${attribute.name}`);
                    let targetPort: EntityPortModel = associatedEntity.getPort(`left-${association.associate}`);

                    if (sourcePort && targetPort) {
                        if (mappedLinkNodes.has(associatedEntity.getID()) &&
                            mappedLinkNodes.get(associatedEntity.getID()).includes(callingEntity.getID())) {
                            const linkId: string = Array.from(links.keys()).find(itemId =>
                                itemId.slice(itemId.indexOf('-') + 1).startsWith(associatedEntity.getID()) && itemId.endsWith(key)
                            );
                            const link2update = links.get(linkId);
                            if (link2update) {
                                link2update.cardinality.self = association.cardinality.associate;
                                link2update.setTargetPort(sourcePort);
                            }
                            const index = mappedLinkNodes.get(associatedEntity.getID()).indexOf(callingEntity.getID());
                            if (index > -1) {
                                mappedLinkNodes.get(associatedEntity.getID()).splice(index, 1);
                            }
                        } else {
                            let link: EntityLinkModel = new EntityLinkModel(association.cardinality);
                            links.set(`${sourcePort.getID()}:${targetPort.getID()}`, createLinks(sourcePort, targetPort, link));
                            mappedLinkNodes.set(key, [...mappedLinkNodes.get(key), associatedEntity.getID()]);
                        }
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
                    links.set(`${sourcePort.getID()}:${targetPort.getID()}`, createLinks(sourcePort, targetPort, link));
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
