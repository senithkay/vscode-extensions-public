/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { Type } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { STNode } from "@wso2-enterprise/syntax-tree";

export interface ArrayElement {
	member: EditableRecordField;
	elementNode: STNode;
}

export class EditableRecordField {
	constructor(
		public type: Type,
		public value?: STNode,
		public parentType?: EditableRecordField,
		public originalType?: Type,
		public childrenTypes?: EditableRecordField[],
		public elements?: ArrayElement[]
	){}

	public hasValue() {
		return !!this.value;
	}
}
