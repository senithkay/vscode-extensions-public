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

import { LinkModel, NodeModel, NodeModelGenerics, PortModel } from '@projectstorm/react-diagrams';
import { EntityLinkModel } from '../../entity-relationship';
import { ServiceLinkModel } from '../../service-interaction';

export class SharedNodeModel extends NodeModel<NodeModelGenerics> {
    constructor(type: string, id: string) {
        super({
            type: type,
            id: id
        });
    }

    handleHover = (ports: PortModel[], task: string) => {
        if (ports.length > 0) {
            ports.forEach((port) => {
                const portLinks: Map<string, LinkModel> = new Map(Object.entries(port.links));
                portLinks.forEach((link) => {
                    if (link.getSourcePort().getID() === port.getID()) {
                        link.fireEvent({}, task);
                    }
                })
            })
        }
    }

    isNodeSelected = (selectedLink: ServiceLinkModel | EntityLinkModel, portIdentifier: string) => {
        if (selectedLink) {
            if (selectedLink.getSourcePort().getID().split('-')[1] === portIdentifier) {
                return true;
            } else if (selectedLink.getTargetPort().getID().split('-')[1] === portIdentifier) {
                return true;
            }
        }
        return false;
    }

    checkSelectedList = (selectedLinks: ServiceLinkModel[], portIdentifier: string) => {
        const checkSelection = (link: ServiceLinkModel) => this.isNodeSelected(link, portIdentifier);
        return selectedLinks.some(checkSelection);
    }
}
