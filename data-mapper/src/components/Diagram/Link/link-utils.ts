import { STKindChecker } from "@wso2-enterprise/syntax-tree";
import { DataMapperPortModel } from "../Port";
import { DataMapperLinkModel } from "./model/DataMapperLink";

export function canConvertLinkToQueryExpr(link: DataMapperLinkModel): boolean {
    const sourcePort = link.getSourcePort() as DataMapperPortModel;
    const targetPort = link.getTargetPort() as DataMapperPortModel;
    
    if (STKindChecker.isRecordField(sourcePort.field)) {
        const fieldType = sourcePort.field.typeName;
        return STKindChecker.isArrayTypeDesc(fieldType) && STKindChecker.isRecordTypeDesc(fieldType.memberTypeDesc);
    }

    return false;
}