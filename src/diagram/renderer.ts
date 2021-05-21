import { Uri } from 'vscode';
import { getLibraryWebViewContent, WebViewOptions, getComposerWebViewOptions, log } from '../utils';
import { sep } from "path";
import { CMP_KIND } from '../tree-view';

export function render(filePath: Uri, startLine: number, startColumn: number, kind: string, name: string): string {
    return renderDiagram(filePath, startLine, startColumn, kind, name);
}

function renderDiagram(filePath: Uri, startLine: number, startColumn: number, kind: string, name: string): string {

    const body = `
        <div class="ballerina-editor design-view-container" id="diagram"></div>
    `;

    const bodyCss = "diagram";

    const styles = `
        body {
            background: #f1f1f1;
        }
        .overlay {
            display: none;
        }
        .drop-zone.rect {
            fill-opacity: 0;
        }
        #diagram {
            height: 100%;
            display: inline-block;
            width: 100%
        }
        #errors {
            display: table;
            width: 100%;
            height: 100%;
        }
        #errors span { 
            display: table-cell;
            vertical-align: middle;
            text-align: center;
        }
        #warning {
            position: absolute;
            top: 15px;
            position: absolute;
            overflow: hidden;
            height: 25px;
            vertical-align: bottom;
            text-align: center;
            color: rgb(255, 90, 30);
            width: 100%;
        }
        #warning p {
            line-height: 25px;
        }
    `;

    log('go through create');

    kind = kind === CMP_KIND.MAIN_FUNCTION ? CMP_KIND.FUNCTION : kind;
    kind = kind.charAt(0).toUpperCase() + kind.slice(1);

    let ballerinaFilePath = filePath.fsPath;
    if (process.platform === 'win32') {
        ballerinaFilePath = '/' + ballerinaFilePath.split(sep).join("/");
    }
    log('render fP: ' + ballerinaFilePath);
    log('render stL: ' + startLine);
    log('render stC: ' + startColumn);
    const scripts = `
        function loadedScript() {
            window.langclient = getLangClient();
            let filePath = ${JSON.stringify(ballerinaFilePath)};
            let startLine = ${JSON.stringify(startLine.toString())};
            let startColumn = ${JSON.stringify(startColumn.toString())};
            let name = ${JSON.stringify(name)};
            let kind = ${JSON.stringify(kind)};
            function drawDiagram() {
                try {
                    const options = {
                        target: document.getElementById("diagram"),
                        editorProps: {
                            langClient: getLangClient(),
                            filePath,
                            startLine,
                            startColumn,
                            name,
                            kind
                        }
                    };
                    const diagram = ballerinaComposer.renderDiagramEditor(options);
                    webViewRPCHandler.addMethod("updateDiagram", (args) => {
                        console.log("In updateDiagram");
                        console.log(args[0]);
                        diagram.update({
                            langClient: getLangClient(),
                            filePath: args[0].filePath,
                            startLine: args[0].startLine,
                            startColumn: args[0].startColumn,
                            name: args[0].name,
                            kind: args[0].kind
                        });
                        return Promise.resolve({});
                    });
                } catch(e) {
                    if (e.message === 'ballerinaComposer is not defined') {
                        drawLoading();
                        return;
                    }
                    console.log(e.stack);
                    drawError('Oops. Something went wrong. ' + e.message);
                }
            }
            function drawError(message) {
                document.getElementById("diagram").innerHTML = \`
                <div id="errors">
                    <span>\$\{message\}</span>
                </div>
                \`;
            }
            function drawLoading() {
                document.getElementById("diagram").innerHTML = \`
                <div class="loader"></div>
                \`;
            }
            drawDiagram();
        }
    `;

    const webViewOptions: WebViewOptions = {
        ...getComposerWebViewOptions(),
        body, scripts, styles, bodyCss
    };

    return getLibraryWebViewContent(webViewOptions);
}

export function renderError() {
    return `
    <!DOCTYPE html>
    <html>
    
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body>
    <div>
        Could not connect to the parser service. Please try again after restarting vscode.
        <a href="command:workbench.action.reloadWindow">Restart</a>
    </div>
    </body>
    </html>
    `;
}
