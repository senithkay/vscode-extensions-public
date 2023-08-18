import { waitUntil } from "../util";
import { By, WebView } from "vscode-extension-tester";

export class GraphqlTryItView {
    graphqlView: WebView;

    constructor(treeItem: WebView) {
        this.graphqlView = treeItem;
    }

    async clickExplorer() {
        const explorerSelector = By.xpath("//button[@title='Toggle Explorer']");
        await waitUntil(explorerSelector, 10000);
        const explorerBtn = await this.graphqlView.findWebElement(explorerSelector);
        await explorerBtn.click();
    }

    async selectQueryVariable() {
        const allBtnSelector = By.className("graphiql-explorer-field-view");
        await waitUntil(allBtnSelector);
        const allBtn = await this.graphqlView.findWebElement(allBtnSelector);
        await allBtn.click();

        const querySelector = By.xpath("//div[@class='graphiql-explorer-node graphiql-explorer-active']//span");
        await waitUntil(querySelector, 10000);
        await (await this.graphqlView.findWebElement(querySelector)).click();
    }

    async verifyQueryGeneration() {
        const querySelector = By.className("CodeMirror-code");
        await waitUntil(querySelector, 10000);
        await waitUntil(By.xpath("//span[@class='cm-property']"), 10000);
    }

    async execute() {
        const executeBtnSelector = By.xpath("//button[@class='execute-button']");
        await waitUntil(executeBtnSelector, 10000);
        const executeBtn = await this.graphqlView.findWebElement(executeBtnSelector);
        await executeBtn.click();
    }

    async getResponse() {
        const activeSelector = By.xpath("//span[@class='cm-number']");
        await waitUntil(activeSelector, 10000);
        const activeResponse = await this.graphqlView.findWebElement(activeSelector);
        const response = await activeResponse.getText();
        return response;
    }
}
