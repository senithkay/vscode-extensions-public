import { FunctionDefinition, RequiredParam, STKindChecker } from "@wso2-enterprise/syntax-tree";

import { TypeDescriptor } from "../../Diagram/Node/commons/DataMapperNode";

import { DataMapperInputParam } from "./InputParamsPanel/types";

export function getFnNameFromST(fnST: FunctionDefinition) {
    return fnST && fnST.functionName.value;
}

export function getInputsFromST(fnST: FunctionDefinition): DataMapperInputParam[] {
    let params: DataMapperInputParam[] = [];
    if (fnST) {
        // TODO: Check other Param Types
        const reqParams = fnST.functionSignature.parameters.filter((val) => STKindChecker.isRequiredParam(val)) as RequiredParam[];
        params = reqParams.map((param) => ({
            name: param.paramName.value,
            type: getTypeFromTypeDesc(param.typeName)
        }));
    }
    return params;
}

export function getOutputTypeFromST(fnST: FunctionDefinition) {
    return getTypeFromTypeDesc(fnST.functionSignature?.returnTypeDesc?.type)
}

export function getTypeFromTypeDesc(typeDesc: TypeDescriptor) {
    if (typeDesc && STKindChecker.isSimpleNameReference(typeDesc)) {
        return typeDesc.name.value;
    }
    return "";
}

