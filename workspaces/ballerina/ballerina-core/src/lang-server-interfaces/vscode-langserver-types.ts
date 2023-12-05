import { Position, CodeActionContext, TextDocumentIdentifier } from "vscode-languageserver-types";

export interface CodeActionParams extends WorkDoneProgressParams, PartialResultParams {
    textDocument: TextDocumentIdentifier;
    range: Range;
    context: CodeActionContext;
}

export interface RenameParams extends WorkDoneProgressParams {
    textDocument: TextDocumentIdentifier;
    position: Position;
    newName: string;
}

export interface TextDocumentPositionParams {
    textDocument: TextDocumentIdentifier;
    position: Position;
}

export interface DidOpenTextDocumentParams {
    textDocument: TextDocumentItem;
}

export interface DidChangeTextDocumentParams {
    textDocument: VersionedTextDocumentIdentifier;
    contentChanges: TextDocumentContentChangeEvent[];
}

export interface DidCloseTextDocumentParams {
    textDocument: TextDocumentIdentifier;
}

export interface WorkDoneProgressParams {
    workDoneToken?: ProgressToken;
}

export interface PartialResultParams {
    partialResultToken?: ProgressToken;
}

export interface TextDocumentItem {
    uri: DocumentUri;
    languageId: string;
    version: integer;
    text: string;
}

export interface VersionedTextDocumentIdentifier extends TextDocumentIdentifier {
    version: integer;
}

export type TextDocumentContentChangeEvent = {
    range: Range;
    rangeLength?: uinteger;
    text: string;
} | {
    text: string;
};

export type DocumentUri = string;
export type integer = number;
export type uinteger = number;
export type ProgressToken = number | string;
