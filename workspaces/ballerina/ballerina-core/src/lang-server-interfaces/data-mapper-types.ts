import { Position } from "vscode-languageserver-types";
import { DocumentIdentifier } from "./common-types";

export interface DefinitionRequest {
    position: Position;
    textDocument: DocumentIdentifier;
}
