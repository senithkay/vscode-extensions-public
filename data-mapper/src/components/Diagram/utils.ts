import { ExpressionFunctionBody, FieldAccess, RecordField, RecordTypeDesc, RequiredParam, SimpleNameReference, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";
import { DataMapperPortModel } from "./Port/model/DataMapperPortModel";

export function generatePortId(typeNode: RecordField|RecordTypeDesc, type: "IN" | "OUT", nodeValue: ExpressionFunctionBody|RequiredParam,
         parentModel?: DataMapperPortModel) {
    // let id: string = "." + type;
    // if (STKindChecker.isRecordField(typeNode)) {
    //     id = typeNode.fieldName.value + "." + id;
    // } else if (STKindChecker.isRecordTypeDesc(typeNode)) {
    //     if (parentModel) {
            
    //     } else {
    //         const valueNode = 
    //     }
    //     console.log("No field ID");
    // }
    // let parent = parentModel;
    // let parentTypeNode = parentModel?.typeNode;
    // while (parent !== undefined) {
    //     if (STKindChecker.isRecordField(parentTypeNode)) {
    //         id = parentTypeNode.fieldName.value + "." + id;
    //     } else if (STKindChecker.isRecordTypeDesc(parentTypeNode)) {
            
    //     }
    //     parent = parent.parentModel;
    // }
    // return id;
}

export function getFieldNames(expr: FieldAccess) {
    const fieldNames: string[] = [];
    let nextExp: FieldAccess = expr;
    while(nextExp && STKindChecker.isFieldAccess(nextExp)) {
        fieldNames.push((nextExp.fieldName as SimpleNameReference).name.value);
        nextExp = STKindChecker.isFieldAccess(nextExp.expression) ? nextExp.expression : undefined;
    } 
    return fieldNames.reverse();
}