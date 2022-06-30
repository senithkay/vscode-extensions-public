import { SpecificField, FieldAccess, SimpleNameReference } from "@wso2-enterprise/syntax-tree";

export class FieldAccessToSpecificFied {
	constructor(
		public fields: SpecificField[],
		public value: FieldAccess|SimpleNameReference,
		public otherVal: any = undefined
	){}

	public createLink() {

	}
}