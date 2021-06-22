import { STKindChecker, STNode } from "@ballerina/syntax-tree";

import { Path, PathSegment, Payload, QueryParam, QueryParamCollection } from "./types";

export function convertPayloadStringToPayload(payloadString: string): Payload {
    const payload: Payload = {
        type: "",
        name: ""
    }

    const payloadSplitted = payloadString.split("@http:Payload");
    if (payloadSplitted.length > 1) {
        const typeNameSplited = payloadSplitted[payloadSplitted.length - 1].trim().split(" ");
        payload.type = typeNameSplited[0];
        payload.name = typeNameSplited[1];
    }
    return payload;
}

export function getBallerinaPayloadType(payload: Payload, addComma?: boolean): string {
    return payload.type && payload.name && payload.type !== ""
        && payload.name !== "" ? ("@http:Payload " + payload.type + " " + payload.name + (addComma ? "," : "")) : "";
}

export function convertQueryParamStringToSegments(queryParamsString: string): QueryParamCollection {
    const queryParamCollection: QueryParamCollection = {
        queryParams: []
    };

    if (queryParamsString !== "") {
        const queryParamSplited: string[] = queryParamsString.split("&");
        queryParamSplited.forEach((value, index) => {
            const queryParam: QueryParam = {
                id: index,
                name: "",
                type: ""
            };
            if (value.includes("=")) {
                const queryParamSplited: string[] = value.split("=");
                if (queryParamSplited.length === 2 && queryParamSplited[1].startsWith("[") && queryParamSplited[1].endsWith("]")) {
                    const formattedQueryParam = queryParamSplited[1].replace("[", "").replace("]", "");
                    const splitedNameAndType: string[] = formattedQueryParam.split(" ");
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
    const path: Path = {
        segments: []
    };
    if (pathString !== "") {
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
    const type: string = splitedPathParam[0];
    const name: string = pathParamString.substr(type.length + 1, pathParamString.length - 1);
    pathSegment = {
        id: 0,
        isParam: true,
        name,
        type
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

export function genrateBallerinaQueryParams(queryParamCollection: QueryParamCollection, noLastComma?: boolean): string {
    let queryParamsAsString: string = "";
    queryParamCollection.queryParams.forEach((value, index, array) => {
        if (noLastComma && index === (array.length - 1)) {
            queryParamsAsString += value.type + " " + value.name;
        } else {
            queryParamsAsString += value.type + " " + value.name + ", ";
        }
    });
    return queryParamsAsString;
}

export function generateQueryParamFromST(params: STNode[]): string {
    let queryParamString: string = "";
    if (params && params.length > 0) {

        const filteredParams: STNode[] = [];
        params.forEach((value) => {
            if (!STKindChecker.isCommaToken(value) && !value.source.includes("@http:Payload") && !value.source.includes("http:Request") && !value.source.includes("http:Caller")) {
                filteredParams.push(value);
            }
        });

        if (filteredParams.length > 0) {
            queryParamString += "?";
        }

        filteredParams.forEach((value, index, array) => {
            const queryParamSource = value.source.trim();
            const splitedQueryParam = queryParamSource.split(" ");
            const type: string = splitedQueryParam[0];
            const name: string = queryParamSource.substr(type.length + 1, queryParamSource.length - 1);
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
