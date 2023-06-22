/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import React from 'react';
import { DefaultLinkFactory } from '@projectstorm/react-diagrams';
import { ServiceLinkModel } from './ServiceLinkModel';
import { ServiceLinkWidget } from './ServiceLinkWidget';

export class ServiceLinkFactory extends DefaultLinkFactory {
	constructor() {
		super('serviceLink');
	}

	generateModel(event: { initialConfig: any }): ServiceLinkModel {
		return new ServiceLinkModel(event.initialConfig.level, event.initialConfig.location);
	}

	generateReactWidget(event: { model: ServiceLinkModel }): JSX.Element {
		return <ServiceLinkWidget link={event.model} engine={this.engine} />;
	}
}
