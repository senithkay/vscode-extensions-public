/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { IDMType } from "@wso2-enterprise/ballerina-core";

export interface ArrayElement {
	member: DMTypeWithValue;
	elementNode: any;
}

export class DMTypeWithValue {
	constructor(
		public type: IDMType,
		public value?: any,
		public parentType?: DMTypeWithValue,
		public originalType?: IDMType,
		public childrenTypes?: DMTypeWithValue[],
		public elements?: ArrayElement[]
	){}

	public hasValue() {
		return !!this.value;
	}

	public setValue(value: any) {
		this.value = value;
	}
}
