import { FieldAccess, SimpleNameReference, STNode } from "@wso2-enterprise/syntax-tree";

export class FieldAccessToSpecificFied {
	constructor(
		public fields: STNode[],
		public value: FieldAccess | SimpleNameReference,
		public otherVal: STNode = undefined
	){}

	public createLink() {

	}
}