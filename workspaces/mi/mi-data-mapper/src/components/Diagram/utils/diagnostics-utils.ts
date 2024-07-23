/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { Node, ts } from "ts-morph";

export function getDiagnostics(node: Node): ts.Diagnostic[] {

    if (!node) {
        return [];
    }

    const fileName = node.getSourceFile().getFilePath();
    const fileContent = node.getSourceFile().getText();
    const program = createProgram(fileName, fileContent);

    let targetNode = node;

    const parent = node.getParent();
    if (parent && (Node.isPropertyAssignment(parent) || Node.isReturnStatement(parent))) {
        targetNode = parent;
    }

    const nativeDiagnostics = ts.getPreEmitDiagnostics(program).concat(program.getGlobalDiagnostics());
    const tsMorphDiagnostics = node.getSourceFile().getPreEmitDiagnostics().map(diagnostic => {
        return diagnostic.compilerObject;
    });

    const allDiagnostics = nativeDiagnostics.concat(tsMorphDiagnostics);

    return allDiagnostics.filter(diagnostic =>
        diagnostic.start >= targetNode.getStart()
        && diagnostic.start + diagnostic.length <= targetNode.getEnd()
    );
}

export function getDiagnosticMessage(diagnostic: ts.Diagnostic): string {
    const msgText = diagnostic.messageText;

    if (typeof msgText !== 'string') {
        // Return only the first message
        return msgText.messageText;
    }

    return msgText;
}

function createProgram(fileName: string, fileContent: string): ts.Program {
    const sourceFile = ts.createSourceFile(fileName, fileContent, ts.ScriptTarget.ES2015, true);

    const host: ts.CompilerHost = {
        fileExists: (filePath) => filePath === fileName,
        readFile: (filePath) => filePath === fileName ? fileContent : undefined,
        getCanonicalFileName: (filePath) => filePath,
        getCurrentDirectory: () => "",
        getNewLine: () => "\n",
        getDefaultLibFileName: (options) => "lib.d.ts",
        useCaseSensitiveFileNames: () => true,
        writeFile: () => {},
        getSourceFile: (filePath, languageVersion) => filePath === fileName ? sourceFile : undefined,
        getDirectories: () => [],
        getEnvironmentVariable: () => ""
    };

    const compilerOptions: ts.CompilerOptions = {
        strict: true,
        target: ts.ScriptTarget.ES2015,
        module: ts.ModuleKind.CommonJS
    };

    return ts.createProgram([fileName], compilerOptions, host);
}
