/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { before, describe } from "mocha";
import { join } from "path";
import { By, EditorView, VSBrowser, WebDriver, WebView } from "vscode-extension-tester";
import {
    getElementByXPathUsingTestID,
    switchToIFrame,
    waitUntil,
    waitForElementToAppear,
    clickListItem, openNodeMenu, clickWebElement, selectItemFromAutocomplete
} from "./util";
import { ExtendedEditorView } from "./utils/ExtendedEditorView";

describe('VSCode Graphql Designer Webview UI Tests', () => {
    const PROJECT_ROOT = join(__dirname, '..', '..', 'ui-test', 'data', 'starwars');
    const FILE_NAME = 'service.bal';
    let webview: WebView;
    let browser: VSBrowser;
    let driver: WebDriver;

    before(async () => {
        const editorView = new EditorView();
        await editorView.closeAllEditors();

        browser = VSBrowser.instance;
        driver = browser.driver;
        webview = new WebView();
        await browser.openResources(PROJECT_ROOT, `${PROJECT_ROOT}/${FILE_NAME}`);
    });

    it('Open graphql designer using code lens', async () => {
        const extendedEditorView = new ExtendedEditorView(new EditorView());
        const lens = await extendedEditorView.getCodeLens('Visualize');
        await lens.click();

        await switchToIFrame('Overview Diagram', driver);
        await waitUntil(getElementByXPathUsingTestID("graphql-canvas-widget-container"), 30000);
    });

    it('Verify graphql root node and its fields ', async () => {
        await waitForElementToAppear("graphql-root-head-/graphql2");

        await waitForElementToAppear("resource-identifier-hero");
        await waitForElementToAppear("resource-type-Character!");

        await waitForElementToAppear("resource-identifier-reviews");
        await waitForElementToAppear("resource-type-[Review]!");

        await waitForElementToAppear("resource-identifier-characters");
        await waitForElementToAppear("resource-type-[Character]!");

        await waitForElementToAppear("resource-identifier-droid");
        await waitForElementToAppear("resource-type-Droid");

        await waitForElementToAppear("resource-identifier-human");
        await waitForElementToAppear("resource-type-Human");

        await waitForElementToAppear("resource-identifier-starship");
        await waitForElementToAppear("resource-type-Starship");

        await waitForElementToAppear("resource-identifier-search");
        await waitForElementToAppear("resource-type-[SearchResult!]");

        await waitForElementToAppear("resource-identifier-starship");
        await waitForElementToAppear("resource-type-Starship");

        await waitForElementToAppear("resource-identifier-reviewAdded");
        await waitForElementToAppear("resource-type-Review!");

        await waitForElementToAppear("remote-identifier-createReview");
        await waitForElementToAppear("remote-type-Review!");

        await waitForElementToAppear("resource-identifier-profile");
        await waitForElementToAppear("resource-type-profile!");
    });

    it('Verify record nodes and fields', async () => {
        await waitForElementToAppear("record-head-Review");

        await waitForElementToAppear("record-field-name-episode");
        await waitForElementToAppear("record-field-type-Episode!");

        await waitForElementToAppear("record-field-name-stars");
        await waitForElementToAppear("record-field-type-Int!");

        await waitForElementToAppear("record-field-name-commentary");
        await waitForElementToAppear("record-field-type-String");
    });

    it('Verify enum nodes and fields', async () => {
        await waitForElementToAppear("enum-head-Episode");

        await waitForElementToAppear("enum-field-JEDI");
        await waitForElementToAppear("enum-field-EMPIRE");
        await waitForElementToAppear("enum-field-NEWHOPE");
    });

    it('Verify service nodes and fields', async () => {
        await waitForElementToAppear("service-class-head-Droid");

        await waitForElementToAppear("service-field-id");
        await waitForElementToAppear("service-field-type-String");

        await waitForElementToAppear("service-field-name");
        await waitForElementToAppear("service-field-type-String");

        await waitForElementToAppear("service-field-friends");
        await waitForElementToAppear("service-field-type-[Character!]!");

        await waitForElementToAppear("service-field-appearsIn");
        await waitForElementToAppear("service-field-type-[Episode!]!");

        await waitForElementToAppear("service-field-primaryFunction");
        await waitForElementToAppear("service-field-type-String");

        await waitForElementToAppear("service-class-head-Human");
        await waitForElementToAppear("service-class-head-Starship");
    });

    it('Verify interface nodes and fields', async () => {
        await waitForElementToAppear("interface-head-Character");

        await waitForElementToAppear("interface-func-id");
        await waitForElementToAppear("interface-func-type-String!");

        await waitForElementToAppear("interface-func-name");
        await waitForElementToAppear("interface-func-type-String!");

        await waitForElementToAppear("interface-func-friends");
        await waitForElementToAppear("interface-func-type-[Character!]!");

        await waitForElementToAppear("interface-func-appearsIn");
        await waitForElementToAppear("interface-func-type-[Episode!]!");

        await waitForElementToAppear("interface-implementation-Human");
        await waitForElementToAppear("interface-implementation-Droid");
    });

    it('Verify union nodes and fields', async () => {
        await waitForElementToAppear("union-head-SearchResult");

        await waitForElementToAppear("union-field-Human");
        await waitForElementToAppear("union-field-Droid");
        await waitForElementToAppear("union-field-Starship");
    });

    it('Verify hierarchical resource nodes and fields', async () => {
        await waitForElementToAppear("hierarchical-head-profile");

        await waitForElementToAppear("hierarchical-field-quote");
        await waitForElementToAppear("hierarchical-field-type-String!");
        await waitForElementToAppear("hierarchical-field-name");
        await waitForElementToAppear("hierarchical-field-type-name!");

        await waitForElementToAppear("hierarchical-head-name");

        await waitForElementToAppear("hierarchical-field-first");
        await waitForElementToAppear("hierarchical-field-type-String!");
        await waitForElementToAppear("hierarchical-field-last");
        await waitForElementToAppear("hierarchical-field-type-String!");
    });

    it('Verify links', async () => {
        await waitForElementToAppear("right-search-left-SearchResult");
        await waitForElementToAppear("right-hero-left-Character");
        await waitForElementToAppear("right-reviewAdded-left-Review");
        await waitForElementToAppear("right-starship-left-Starship");
        await waitForElementToAppear("right-human-left-Human");
        await waitForElementToAppear("right-appearsIn-left-Episode");
        await waitForElementToAppear("right-Starship-left-Starship");
    });

    it('Verify filtering of operations', async () => {
        await clickWebElement(webview, getElementByXPathUsingTestID("operation-filter"));

        await clickListItem(webview, "operation-type", "Mutations");

        await waitForElementToAppear("graphql-root-head-/graphql2");
        await waitForElementToAppear("remote-identifier-createReview");
        await waitForElementToAppear("record-head-Review");
        await waitForElementToAppear("enum-head-Episode");

        await clickWebElement(webview, getElementByXPathUsingTestID("operation-filter"));

        await clickListItem(webview, "operation-type", "Subscription");

        await waitForElementToAppear("graphql-root-head-/graphql2");
        await waitForElementToAppear("resource-identifier-reviewAdded");
        await waitForElementToAppear("record-head-Review");
        await waitForElementToAppear("enum-head-Episode");
    });

    it('Verify filtering of nodes', async () => {
        await selectItemFromAutocomplete(webview, "/graphql2", "Human");

        await waitForElementToAppear("service-class-head-Human");
        await waitForElementToAppear("service-class-head-Droid");
        await waitForElementToAppear("interface-head-Character");
        await waitForElementToAppear("enum-head-Episode");
        await waitForElementToAppear("service-class-head-Starship");
    });

    it('Verify subGraph filtering', async () => {
        await selectItemFromAutocomplete(webview, "Human", "/graphql2", true);

        await clickWebElement(webview, getElementByXPathUsingTestID("operation-filter"));

        await clickListItem(webview, "operation-type", "All Operations");

        await waitForElementToAppear("union-head-SearchResult");

        await openNodeMenu(webview, "union-head-SearchResult", "filter-node-menu");
        await clickWebElement(webview, getElementByXPathUsingTestID("show-subgraph-menu"));

        await waitForElementToAppear("union-head-SearchResult");
        await waitForElementToAppear("service-class-head-Droid");
        await waitForElementToAppear("service-class-head-Human");
        await waitForElementToAppear("service-class-head-Starship");
        await waitForElementToAppear("interface-head-Character");
        await waitForElementToAppear("enum-head-Episode");
    });
});
