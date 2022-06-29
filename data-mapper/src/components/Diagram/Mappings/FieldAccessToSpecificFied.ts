import { SpecificField, FieldAccess, SimpleNameReference } from "@wso2-enterprise/syntax-tree";

export interface FieldAccessToSpecificFied {
	fields: SpecificField[];
	value: FieldAccess|SimpleNameReference;
}