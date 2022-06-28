import { WebView, VSBrowser, By, EditorView, Key } from 'vscode-extension-tester';
import { join } from 'path';
import { before, describe, it } from 'mocha';
import { expect } from 'chai';
import { wait, getDiagramExplorer } from './util';
import { DIAGRAM_LOADING_TIME, PROJECT_RUN_TIME } from './constants';

describe('Swagger view UI Tests', () => {
    const PROJECT_ROOT = join(__dirname, '..', '..', '..', 'test', 'data', 'helloServicePackage');

    before(async () => {
        await VSBrowser.instance.openResources(PROJECT_ROOT);
        await wait(2000);
    });

    it('Test tryit button', async () => {
        const editorView = new EditorView();
        await editorView.closeAllEditors();
        const diagramExplorer = await getDiagramExplorer();

        const rootFolder = (await diagramExplorer.getVisibleItems())[0];
        await rootFolder.expand();

        // Open low code diagram
        (await rootFolder.findChildItem("hello_service.bal"))?.click();
        await wait(DIAGRAM_LOADING_TIME)

        // switch to low code window
        const webview = new WebView();
        await webview.switchToFrame();

        // run project
        const runButton = (await webview.findWebElements(By.className("action-button")))[0];
        expect(runButton).is.not.undefined;
        await runButton.click();
        await wait(PROJECT_RUN_TIME)

        // open swagger view
        const tryItButton = (await webview.findWebElements(By.className("action-button")))[1];
        expect(tryItButton).is.not.undefined;
        await tryItButton.click();
        await webview.switchBack();
        await wait(5000);

        // switch to swagger window
        const swaggerWebView = await new EditorView().openEditor('Swagger', 1) as WebView;
        swaggerWebView.switchToFrame();
        await wait(2000);

        // expand get
        const getTab = await swaggerWebView.findWebElement(By.className("operation-tag-content"));
        expect(getTab).is.not.undefined;
        await getTab.click();
        await wait(2000);

        // click try it
        const tryIt = await swaggerWebView.findWebElement(By.className("try-out__btn"));
        expect(tryIt).is.not.undefined;
        await tryIt.click();
        await wait(2000);

        // clear request body
        const reqBody = await swaggerWebView.findWebElement(By.className("body-param__text"));
        expect(reqBody).is.not.undefined;
        await reqBody.sendKeys((process.platform === "darwin" ? Key.COMMAND : Key.CONTROL), "a", Key.DELETE, Key.END);

        // cilck execute
        const execute = await swaggerWebView.findWebElement(By.className("btn execute opblock-control__btn"));
        expect(execute).is.not.undefined;
        await execute.click();
        await wait(2000);

        // check response
        const codeBlock = await swaggerWebView.findWebElement(By.className("highlight-code"));
        expect(execute).is.not.undefined;
        const reponseBox = await codeBlock.findElement(By.css("code"));
        const reponse = await reponseBox.findElement(By.css("span"));
        expect(await reponse.getText()).is.equal('"Hello, World!"');
    });
});
