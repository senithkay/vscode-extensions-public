import { waitUntil } from "../util";
import { By, WebView } from "vscode-extension-tester";

export class GraphqlTryItView {
    graphqlView: WebView;

    constructor(treeItem: WebView) {
        this.graphqlView = treeItem;
    }

    async clickExplorer() {
        const explorerSelector = By.xpath("//button[@title='Toggle Explorer']");
        const explorerBtn = await waitUntil(explorerSelector, 10000);
        await explorerBtn.click();
    }

    async selectQueryVariable() {
        const allBtnSelector = By.className("graphiql-explorer-field-view");
        const allBtn = await waitUntil(allBtnSelector);
        await allBtn.click();

        const querySelector = By.xpath("//div[@class='graphiql-explorer-node graphiql-explorer-active']//span");
        const queryBtn = await waitUntil(querySelector, 10000);
        await queryBtn.click();
    }

    async verifyQueryGeneration() {
        const querySelector = By.className("CodeMirror-code");
        await waitUntil(querySelector, 10000);
        await waitUntil(By.xpath("//span[@class='cm-property']"), 10000);
    }

    async execute() {
        const executeBtnSelector = By.xpath("//button[@class='execute-button']");
        const executeBtn = await waitUntil(executeBtnSelector, 10000);
        await executeBtn.click();
    }

    async getResponse() {
        const activeSelector = By.xpath("//span[@class='cm-number']");
        const activeResponse = await waitUntil(activeSelector, 10000);
        const response = await activeResponse.getText();
        return response;
    }
}
