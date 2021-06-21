import {ReturnTypeDescriptor, STKindChecker, STNode} from "@ballerina/syntax-tree";
import {
    Path,
    PathSegment,
    Payload,
    QueryParam,
    QueryParamCollection,
    ReturnType,
    ReturnTypeCollection,
    ReturnTypesMap
} from "./types";
import {boolean} from "../../../../ConfigForm/Elements";

export function convertPayloadStringToPayload(payloadString: string): Payload {
    let payload: Payload = {
        type: "",
        name: ""
    }
    if (payloadString && payloadString !== "") {
        const payloadSplitted = payloadString.split("@http:Payload");
        if (payloadSplitted.length > 1) {
            const typeNameSplited = payloadSplitted[payloadSplitted.length - 1].trim().split(" ");
            payload.type = typeNameSplited[0];
            payload.name = typeNameSplited[1];
        }
    }
    return payload;
}

export function getBallerinaPayloadType(payload: Payload, addComma?: boolean): string {
    return payload.type && payload.name && payload.type !== ""
        && payload.name !== "" ? ("@http:Payload " + payload.type + " " + payload.name + (addComma ? ", " : "")) : "";
}

export function convertQueryParamStringToSegments(queryParamsString: string): QueryParamCollection {
    let queryParamCollection: QueryParamCollection = {
        queryParams: []
    };

    if (queryParamsString && queryParamsString !== "") {
        const queryParamSplited: string[] = queryParamsString.split("&");
        queryParamSplited.forEach((value, index) => {
            let queryParam: QueryParam = {
                id: index,
                name: "",
                type: ""
            };
            if (value.includes("=")) {
                let queryParamSplited: string[] = value.split("=");
                if (queryParamSplited.length === 2 && queryParamSplited[1].startsWith("[") && queryParamSplited[1].endsWith("]")) {
                    let formattedQueryParam = queryParamSplited[1].replace("[", "").replace("]", "");
                    let splitedNameAndType: string[] = formattedQueryParam.split(" ");
                    queryParam.id = index;
                    queryParam.name = splitedNameAndType[1];
                    queryParam.type = splitedNameAndType[0];
                    queryParamCollection.queryParams.push(queryParam);
                }
            } else {
                queryParam.id = index;
                queryParam.name = value;
                queryParam.type = "string";
                queryParamCollection.queryParams.push(queryParam);
            }
        });
    }

    return queryParamCollection;
}

/**
 * 
 * @param path path will be like `/name/[string name]/id/[int id]`
 * @returns Path
 */
export function convertPathStringToSegments(pathString: string): Path {
    let path: Path = {
        segments: []
    };
    if (pathString && pathString !== "") {
        const pathSegments: string[] = pathString.split("/");
        pathSegments.forEach((value, index) => {
            let segment: PathSegment;
            if (value.startsWith("[") && value.endsWith("]")) {
                segment = convertPathParamStringToSegment(value.replace("[", "").replace("]", ""));
                segment.id = index;
            } else if (value.startsWith("{") && value.endsWith("}")) {
                segment = {
                    id: index,
                    isParam: true,
                    name: value.replace("{", "").replace("}", ""),
                    type: "string"
                };
            } else {
                segment = {
                    id: index,
                    isParam: false,
                    name: value
                }
            }

            if (value === "") {
                segment.isLastSlash = true;
            }

            path.segments.push(segment);
        });
    }
    return path;
}

/**
* 
* @param pathParamString path param will be like `string id`
* @returns PathSegement
*/
export function convertPathParamStringToSegment(pathParamString: string): PathSegment {
    let pathSegment: PathSegment;
    const splitedPathParam: string[] = pathParamString.split(" ");
    let type: string = splitedPathParam[0];
    let name: string = pathParamString.substr(type.length + 1, pathParamString.length - 1);
    pathSegment = {
        id: 0,
        isParam: true,
        name: name,
        type: type
    };
    return pathSegment;
}

export function genrateBallerinaResourcePath(path: Path): string {
    let pathAsString: string = "";
    path.segments.forEach((value, index, array) => {
        if (index === (array.length - 1)) {
            if (value.isLastSlash) {
                pathAsString += "/";
            } else if (value.isParam) {
                pathAsString += "[" + value.type + " " + value.name + "]";
            } else {
                pathAsString += value.name;
            }
        }
        else if (index === (array.length - 2) && array[array.length - 1].isLastSlash) {
            if (value.isLastSlash) {
                pathAsString += "/";
            } else if (value.isParam) {
                pathAsString += "[" + value.type + " " + value.name + "]";
            } else {
                pathAsString += value.name;
            }
        } else {
            if (value.isLastSlash) {
                pathAsString += "/";
            } else if (value.isParam) {
                pathAsString += "[" + value.type + " " + value.name + "]/";
            } else {
                pathAsString += value.name + "/";
            }
        }
    });
    return pathAsString;
}

export function genrateBallerinaQueryParams(queryParamCollection: QueryParamCollection, addLastComma?: boolean): string {
    let queryParamsAsString: string = "";
    queryParamCollection.queryParams.forEach((value, index, array) => {
        if (index === (array.length - 1)) {
            queryParamsAsString += value.type + " " + value.name + (addLastComma ? ", " : "");
        } else {
            queryParamsAsString += value.type + " " + value.name + ", ";
        }
    });
    return queryParamsAsString;
}

export function generateQueryParamFromST(params: STNode[]): string {
    let queryParamString: string = "";
    if (params && params.length > 0) {

        let filteredParams: STNode[] = [];
        params.forEach((value) => {
            if (!STKindChecker.isCommaToken(value) && !value.source.includes("@http:Payload") && !value.source.includes("http:Request") && !value.source.includes("http") && !value.source.includes("Request") && !value.source.includes("http:Caller") && !value.source.includes("Caller")) {
                filteredParams.push(value);
            }
        });

        if (filteredParams.length > 0) {
            queryParamString += "?";
        }

        filteredParams.forEach((value, index, array) => {
            let queryParamSource = value.source.trim();
            let splitedQueryParam = queryParamSource.split(" ");
            let type: string = splitedQueryParam[0];
            let name: string = queryParamSource.substr(type.length + 1, queryParamSource.length - 1);
            if (index === (array.length - 1)) {
                queryParamString += name + "=[" + type + " " + name + "]";
            } else {
                queryParamString += name + "=[" + type + " " + name + "]&";
            }
        });
    }
    return queryParamString;
}

export function extractPayloadFromST(params: STNode[]): string {
    let payloadString: string = "";
    if (params && params.length > 0) {

        const payload: STNode[] = params.filter((value) => (value.source && value.source.includes("@http:Payload")));
        if (payload.length > 0) {
            payloadString = payload[0].source;
        }
    }
    return payloadString;
}

export function generateQueryParamFromQueryCollection(params: QueryParamCollection): string {
    let queryParamString: string = "";
    if (params && params.queryParams && params.queryParams.length > 0) {
        queryParamString += "?";
        params.queryParams.forEach((value, index, array) => {
            if (index === (array.length - 1)) {
                queryParamString += value.name + "=[" + value.type + " " + value.name + "]";
            } else {
                queryParamString += value.name + "=[" + value.type + " " + value.name + "]&";
            }
        });
    }
    return queryParamString;
}

export function generateReturnTypeFromReturnCollection(params: ReturnType[]): string {
    const returnTypes: string[] = [];
    params.forEach(param => {
        returnTypes.push(`${param.type} ${param.isOptional ? "?" : ""}`);
    })
    return returnTypes.join("|");
}

export function getReturnType(returnTypeDesc: ReturnTypeDescriptor): string {
    if (returnTypeDesc) {
        return returnTypeDesc.type.source.trim();
    } else {
        return "";
    }
}

export function convertReturnTypeStringToSegments(returnTypeString: string): ReturnType[] {
    const codeReturnTypes = returnTypeString?.split("|");
    const returnTypes: ReturnType[] = [];
    if (codeReturnTypes) {
        codeReturnTypes.forEach((returnType, index) => {
            if (returnType.includes("?")) {
                returnTypes.push({type: returnType.replace("?", "").
                    trim(), isOptional: true, id: index});
            } else {
                returnTypes.push({type: returnType.trim(), isOptional: false, id: index});
            }
        });
    }
    return returnTypes;
}

export function isCallerParamAvailable(params: STNode[]): boolean {
    let isCallerParam: boolean = false;
    if (params && params.length > 0) {

        const caller: STNode[] = params.filter((value) => (value.source && value.source.includes("http:Caller")));
        isCallerParam = caller.length > 0;
    }
    return isCallerParam;
}

export function isRequestParamAvailable(params: STNode[]): boolean {
    let isRequestParam: boolean = false;
    if (params && params.length > 0) {

        const caller: STNode[] = params.filter((value) => (value.source && value.source.includes("http:Request")));
        isRequestParam = caller.length > 0;
    }
    return isRequestParam;
}
