/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from 'react';
import { DefaultLinkFactory } from '@projectstorm/react-diagrams';
import { ConnectorLinkModel } from './ConnectorLinkModel';
import { ConnectorLinkWidget } from './ConnectorLinkWidget';

export class ConnectorLinkFactory extends DefaultLinkFactory {
    constructor() {
        super('connectorLink');
    }

    generateModel(event: { initialConfig: any }): ConnectorLinkModel {
        return new ConnectorLinkModel(event.initialConfig.id);
    }

    generateReactWidget(props: { model: ConnectorLinkModel }): JSX.Element {
        return <ConnectorLinkWidget link={props.model} engine={this.engine} />;
    }
}
