import { ExtendedEditorView } from "./ExtendedEditorView";
import { By, EditorView, Key, WebDriver, WebView } from "vscode-extension-tester";
import {
    clickListItem,
    clickWebElement,
    getElementByXPathUsingTestID, getElementByXPathUsingTitle, getInputElementByXPathUsingValue,
    switchToIFrame,
    waitForElementToAppear,
    waitUntil, waitUntilVisible
} from "../util";

export class GraphqlDesignerView {
    static async verifyGraphqlDesignerCanvasLoad(driver: WebDriver) {
        const extendedEditorView = new ExtendedEditorView(new EditorView());
        const lens = await extendedEditorView.getCodeLens('Visualize');
        await lens.click();

        await switchToIFrame('Overview Diagram', driver);
        await waitUntil(getElementByXPathUsingTestID("graphql-canvas-widget-container"), 30000);
    }

    static async verifyNodeHeader(rootHead: string) {
        await waitForElementToAppear(rootHead);
    }

    static async verifyNodeFields(nodeHeaderList: string[]){
        for (const nodeHeader of nodeHeaderList) {
            await waitForElementToAppear(nodeHeader);
        }
    }

    static async verifyFieldTypes(fieldTypeList: string[]){
        for (const fieldType of fieldTypeList) {
            await waitForElementToAppear(fieldType);
        }
    }

    static async clickOperationFilterOption(webview: WebView, operationFilterOption: string){
        await clickWebElement(webview, getElementByXPathUsingTestID("operation-filter"));
        await clickListItem(webview, "operation-type", operationFilterOption);
    }

    static async openNodeMenu(webview: WebView, nodeTestId: string, menuTestId: string) {
        const options = await webview.findWebElement(By.xpath(`//div[contains(@data-testid, '${nodeTestId}')]/*[contains(@data-testid, '${menuTestId}')]`));
        await waitUntilVisible(options);
        await options.click();
    }

    static async selectNodeToFilter(webview: WebView, currentSelection: string, valueToSelect: string, clearInput: boolean = false) {
        const nodeFilter = await webview.findWebElement(getInputElementByXPathUsingValue(currentSelection));
        await nodeFilter.click();
        if (clearInput) {
            await clickWebElement(webview, getElementByXPathUsingTitle("Clear"));
            await nodeFilter.sendKeys(valueToSelect, Key.DOWN, Key.ENTER);
        } else {
            await nodeFilter.sendKeys(valueToSelect, Key.DOWN, Key.ENTER);
        }
    }

    static async openSubGraph(webview: WebView) {
        await clickWebElement(webview, getElementByXPathUsingTestID("show-subgraph-menu"));
    }
}
