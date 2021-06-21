export interface PathSegment {
    id: number;
    isParam: boolean;
    type?: string;
    name: string;
    isLastSlash?: boolean;
}

export interface Path {
    segments: PathSegment[];
}

export interface QueryParam {
    id: number;
    type: string;
    name: string;
}

export interface QueryParamCollection {
    queryParams: QueryParam[];
}

export interface Resource {
    id: number;
    method: string;
    path: string;
    queryParams?: string;
    payload?: string;
    isCaller?: boolean;
    isRequest?: boolean;
    returnType?: string;
}

export interface Payload {
    type: string;
    name: string;
}

export interface Advanced {
    isCaller?: boolean;
    isRequest?: boolean;
}