import { Uri, Webview } from "vscode";

export function getUri(webview: Webview, extensionUri: Uri, pathList: string[]) {
    if (shouldUseCellViewDevMode(pathList)) {
        return process.env.CELL_VIEW_DEV_HOST;
    }
    if (shouldUseWebViewDevMode(pathList)) {
        return process.env.WEB_VIEW_DEV_HOST;
    }
    return webview.asWebviewUri(Uri.joinPath(extensionUri, ...pathList));
}

function shouldUseCellViewDevMode(pathList: string[]): boolean {
    return pathList[pathList.length - 1] === "cellDiagram.js"
        && process.env.CELL_VIEW_DEV_MODE === "true"
        && process.env.CELL_VIEW_DEV_HOST !== undefined;
}

function shouldUseWebViewDevMode(pathList: string[]): boolean {
    return pathList[pathList.length - 1] === "main.js"
        && process.env.WEB_VIEW_DEV_MODE === "true"
        && process.env.WEB_VIEW_DEV_HOST !== undefined;
}
