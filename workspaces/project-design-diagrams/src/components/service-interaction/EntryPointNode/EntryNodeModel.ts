/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { PortModelAlignment } from '@projectstorm/react-diagrams';
import { CMEntryPoint as EntryPoint } from '@wso2-enterprise/ballerina-languageclient';
import { ServicePortModel } from '../ServicePort/ServicePortModel';
import { SharedNodeModel } from '../../common/shared-node/shared-node';
import { Level } from '../../../resources';

export class EntryNodeModel extends SharedNodeModel {
    level: Level;
    nodeObject: EntryPoint;
    readonly modelVersion: string;

    constructor(id: string, entryPoint: EntryPoint, level: Level, version: string) {
        super('entryPointNode', id);

        this.level = level;
        this.modelVersion = version;
        this.nodeObject = entryPoint;

        this.addPort(new ServicePortModel(id, PortModelAlignment.LEFT));
        this.addPort(new ServicePortModel(id, PortModelAlignment.RIGHT));
    }
}
