import { wait, waitForMultipleElementsLocated, waitUntil, waitUntilTextContains } from "../util";
import { By, WebView, WebDriver, InputBox, EditorView } from "vscode-extension-tester";

export class GraphqlTryItView {
    graphqlView: WebView;

    constructor(treeItem: WebView) {
        this.graphqlView = treeItem;
    }

    // async expandGet() {
    //     await waitUntil(By.className("operation-tag-content"), 30000 );
    //     const operationTag = By.className("operation-tag-content");
    //     const getTab = await this.graphqlView.findWebElement(operationTag);
    //     await getTab.click();
    // }

    // async clickTryItOut(driver: WebDriver) {
    //     const tryItOutButton = By.className("try-out__btn");
    //     await waitForMultipleElementsLocated(driver, [tryItOutButton]);
    //     const tryIt = (await this.graphqlView.findWebElements(By.className("try-out__btn")))[0];
    //     await tryIt.click();
    // }

    // async clickExecute() {
    //     const execute = (await this.graphqlView.findWebElements(By.className("opblock-control__btn")))[0];
    //     await execute.click();
    // }

    // async getResponse() {
    //     await waitUntil(By.className("highlight-code"), 30000 );
    //     const codeBlock = await this.graphqlView.findWebElement(By.className("highlight-code"));
    //     const responseBox = await codeBlock.findElement(By.css("code"));
    //     const response = await responseBox.findElement(By.css("span"));
    //     return response.getText();
    // }

    async clickExplorer() {
        await waitUntil(By.xpath("//button[@title='Toggle Explorer']"), 10000);
        const explorerBtn = await this.graphqlView.findWebElement(By.xpath("//button[@title='Toggle Explorer']"));
        await explorerBtn.click();
    }

    async selectQueryVariable() {
        await waitUntil(By.className("graphiql-explorer-field-view"));
        const allBtn = await this.graphqlView.findWebElement(By.className("graphiql-explorer-field-view"));
        await allBtn.click();

        const graphqlWebView = await new EditorView().openEditor('Graphql') as WebView;
        await waitUntil(By.className("graphiql-explorer-node graphiql-explorer-active"), 10000);
        const activeBtn = await graphqlWebView.findWebElement(By.xpath("//span//*[contains(text(), active)]"));
        await activeBtn.click();
    }

    async verifyQueryGeneration() {
        const querySelector = By.className("CodeMirror-code");
        await waitUntil(querySelector, 10000);
        const query = this.graphqlView.findElement(querySelector);
        await query.findElement(By.xpath("//span//*[contains(text(), active)]")) ;
    }

    async execute() {
        await waitUntil(By.xpath("//button[@class='execute-button']"), 10000);
        const executeBtn = await this.graphqlView.findWebElement(By.xpath("//button[@class='execute-button']"));
        await executeBtn.click();
    }

    async getResponse() {
        await waitUntil(By.xpath("//span[@class='cm-number']"), 10000);
        const activeResponse = await this.graphqlView.findWebElement(By.xpath("//span[@class='cm-number']"));
        const response = await activeResponse.getText();
        return response;
    }
}
