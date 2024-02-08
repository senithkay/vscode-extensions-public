import { NodePosition, TypeDefinition } from "@wso2-enterprise/syntax-tree";
import { CompletionResponse } from "../../lang-server-interfaces/extended-lang-server-types";

export interface CreateServiceRequest {
    position: NodePosition;
}

export interface UpdateServiceRequest {
    position: NodePosition;
}

export interface DeleteServiceRequest {
    position: NodePosition;
}

export interface CreateResourceRequest {
    position: NodePosition;
    source: string;
}

export interface UpdateResourceRequest {
    position: NodePosition;
}

export interface DeleteResourceRequest {
    position: NodePosition;
}

export interface KeywordTypeResponse {
    completions: CompletionResponse[]
}

export interface RecordSTRequest {
    recordName: string;
}

export interface RecordSTResponse {
    recordST: TypeDefinition;
}

export interface goToSourceRequest {
    position: NodePosition;
    fileUri: string;
}
