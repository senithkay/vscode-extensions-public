/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { CMLocation as Location } from '@wso2-enterprise/ballerina-languageclient';
import { SharedLinkModel } from '../../common/shared-link/shared-link';
import { Level } from '../../../resources';

export class ServiceLinkModel extends SharedLinkModel {
	readonly level: Level;
	readonly location: Location;
	readonly testId: string;

	constructor(level: Level, location: Location, testId?: string) {
		super('serviceLink');
		this.level = level;
		this.location = location;
		this.testId = testId;
	}
}
