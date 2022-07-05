import { SpecificField, FieldAccess, SimpleNameReference, STNode } from "@wso2-enterprise/syntax-tree";

export class FieldAccessToSpecificFied {
	constructor(
		public fields: SpecificField[],
		public value: FieldAccess|SimpleNameReference,
		public otherVal: STNode = undefined
	){}

	public createLink() {

	}
}