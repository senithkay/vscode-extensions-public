import { before, describe } from "mocha";
import { join } from "path";
import { By, EditorView, Key, VSBrowser, WebDriver, WebView } from "vscode-extension-tester";
import { getElementByXPath, switchToIFrame, wait, waitUntil } from "./util";
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
        await waitUntil(getElementByXPath("graphql-canvas-widget"));
    });

    it('Verify graphql root node and its fields ', async () => {
        await waitUntil(getElementByXPath("graphql-root-head-/graphql2"));

        await waitUntil(getElementByXPath("resource-identifier-hero"));
        await waitUntil(getElementByXPath("resource-type-Character!"));

        await waitUntil(getElementByXPath("resource-identifier-reviews"));
        await waitUntil(getElementByXPath("resource-type-[Review]!"));

        await waitUntil(getElementByXPath("resource-identifier-characters"));
        await waitUntil(getElementByXPath("resource-type-[Character]!"));

        await waitUntil(getElementByXPath("resource-identifier-droid"));
        await waitUntil(getElementByXPath("resource-type-Droid"));

        await waitUntil(getElementByXPath("resource-identifier-human"));
        await waitUntil(getElementByXPath("resource-type-Human"));

        await waitUntil(getElementByXPath("resource-identifier-starship"));
        await waitUntil(getElementByXPath("resource-type-Starship"));

        await waitUntil(getElementByXPath("resource-identifier-search"));
        await waitUntil(getElementByXPath("resource-type-[SearchResult!]"));

        await waitUntil(getElementByXPath("resource-identifier-starship"));
        await waitUntil(getElementByXPath("resource-type-Starship"));

        await waitUntil(getElementByXPath("resource-identifier-reviewAdded"));
        await waitUntil(getElementByXPath("resource-type-Review!")); 

        await waitUntil(getElementByXPath("remote-identifier-createReview"));
        await waitUntil(getElementByXPath("remote-type-Review!"));

        await waitUntil(getElementByXPath("resource-identifier-profile"));
        await waitUntil(getElementByXPath("resource-type-profile!"));
    });

    it('Verify record nodes and fields', async () => {
        await waitUntil(getElementByXPath("record-head-Review"));

        await waitUntil(getElementByXPath("record-field-name-episode"));
        await waitUntil(getElementByXPath("record-field-type-Episode!"));

        await waitUntil(getElementByXPath("record-field-name-stars"));
        await waitUntil(getElementByXPath("record-field-type-Int!"));

        await waitUntil(getElementByXPath("record-field-name-commentary"));
        await waitUntil(getElementByXPath("record-field-type-String"));
    });

    it('vVerify enum nodes and fields', async () => {
        await waitUntil(getElementByXPath("enum-head-Episode"));

        await waitUntil(getElementByXPath("enum-field-JEDI"));
        await waitUntil(getElementByXPath("enum-field-EMPIRE"));
        await waitUntil(getElementByXPath("enum-field-NEWHOPE"));
    });

    it('Verify service nodes and fields', async () => {
        await waitUntil(getElementByXPath("service-class-head-Droid"));

        await waitUntil(getElementByXPath("service-field-id"));
        await waitUntil(getElementByXPath("service-field-type-String"));

        await waitUntil(getElementByXPath("service-field-name"));
        await waitUntil(getElementByXPath("service-field-type-String"));

        await waitUntil(getElementByXPath("service-field-friends"));
        await waitUntil(getElementByXPath("service-field-type-[Character!]!"));

        await waitUntil(getElementByXPath("service-field-appearsIn"));
        await waitUntil(getElementByXPath("service-field-type-[Episode!]!"));

        await waitUntil(getElementByXPath("service-field-primaryFunction"));
        await waitUntil(getElementByXPath("service-field-type-String"));

        await waitUntil(getElementByXPath("service-class-head-Human"));
        await waitUntil(getElementByXPath("service-class-head-Starship"));
    });

    it('Verify interface nodes and fields', async () => {
        await waitUntil(getElementByXPath("interface-head-Character"));

        await waitUntil(getElementByXPath("interface-func-id"));
        await waitUntil(getElementByXPath("interface-func-type-String!"));

        await waitUntil(getElementByXPath("interface-func-name"));
        await waitUntil(getElementByXPath("interface-func-type-String!"));

        await waitUntil(getElementByXPath("interface-func-friends"));
        await waitUntil(getElementByXPath("interface-func-type-[Character!]!"));

        await waitUntil(getElementByXPath("interface-func-appearsIn"));
        await waitUntil(getElementByXPath("interface-func-type-[Episode!]!"));

        await waitUntil(getElementByXPath("interface-implementation-Human"));
        await waitUntil(getElementByXPath("interface-implementation-Droid"));
    });

    it('Verify union nodes and fields', async () => {
        await waitUntil(getElementByXPath("union-head-SearchResult"));

        await waitUntil(getElementByXPath("union-field-Human"));
        await waitUntil(getElementByXPath("union-field-Droid"));
        await waitUntil(getElementByXPath("union-field-Starship"));
    });

    it('Verify hierarchical resource nodes and fields', async () => {
        await waitUntil(getElementByXPath("hierarchical-head-profile"));

        await waitUntil(getElementByXPath("hierarchical-field-quote"));
        await waitUntil(getElementByXPath("hierarchical-field-type-String!"));
        await waitUntil(getElementByXPath("hierarchical-field-name"));
        await waitUntil(getElementByXPath("hierarchical-field-type-name!"));

        await waitUntil(getElementByXPath("hierarchical-head-name"));

        await waitUntil(getElementByXPath("hierarchical-field-first"));
        await waitUntil(getElementByXPath("hierarchical-field-type-String!"));
        await waitUntil(getElementByXPath("hierarchical-field-last"));
        await waitUntil(getElementByXPath("hierarchical-field-type-String!"));
    });

    it('Verify links', async () => {
        await waitUntil(getElementByXPath("right-search-left-SearchResult"));
        await waitUntil(getElementByXPath("right-hero-left-Character"));
        await waitUntil(getElementByXPath("right-reviewAdded-left-Review"));
        await waitUntil(getElementByXPath("right-starship-left-Starship"));
        await waitUntil(getElementByXPath("right-human-left-Human"));
        await waitUntil(getElementByXPath("right-appearsIn-left-Episode"));
        await waitUntil(getElementByXPath("right-Starship-left-Starship"));
    });

    it('Verify filtering of operations', async () => {
        // webview = new WebView();
        const nodeFilter = await webview.findWebElement(getElementByXPath("operation-filter"));
    
        await nodeFilter.click();
        // Wait for the dropdown to fully expand and the menu items to be visible
        await waitUntil(By.xpath("//li[text()='Mutations']"));
    
        const options = await nodeFilter.findElement(By.xpath("//li[text()='Mutations']"));
        await wait(1000);
        await options.click();

        await waitUntil(getElementByXPath("graphql-root-head-/graphql2"));
        await waitUntil(getElementByXPath("remote-identifier-createReview"));
        await waitUntil(getElementByXPath("record-head-Review"));
        await waitUntil(getElementByXPath("enum-head-Episode"));

        await nodeFilter.click();
        // Wait for the dropdown to fully expand and the menu items to be visible
        await waitUntil(By.xpath("//li[text()='Subscriptions']"));

        const subOption = await nodeFilter.findElement(By.xpath("//li[text()='Subscriptions']"));
        // wait added to avoid intermittent failure when selecting the dropdown
        await wait(1000);
        await subOption.click();

        await waitUntil(getElementByXPath("graphql-root-head-/graphql2"));
        await waitUntil(getElementByXPath("resource-identifier-reviewAdded"));
        await waitUntil(getElementByXPath("record-head-Review"));
        await waitUntil(getElementByXPath("enum-head-Episode"));
    });

    it('verify filtering of nodes', async () => {
        const nodeFilter = await webview.findWebElement(By.xpath("//input[@value='/graphql2']"));
    
        await nodeFilter.click();
        await nodeFilter.sendKeys("Human",Key.DOWN,Key.ENTER);
    
        await waitUntil(getElementByXPath("service-class-head-Human"));
        await waitUntil(getElementByXPath("service-class-head-Droid"));
        await waitUntil(getElementByXPath("interface-head-Character"));
        await waitUntil(getElementByXPath("enum-head-Episode"));
        await waitUntil(getElementByXPath("service-class-head-Starship"));
    });

    it('verify subGraph filtering', async () => {
        const nodeFilter = await webview.findWebElement(By.xpath("//input[@value='Human']"));
        await nodeFilter.clear();
        const clearBtn = await nodeFilter.findElement(By.xpath("//*[@title='Clear']"));
        await clearBtn.click();

        await nodeFilter.sendKeys("/graphql2",Key.DOWN,Key.ENTER);

        const operationFilter = await webview.findWebElement(getElementByXPath("operation-filter"));
        await operationFilter.click();
        await waitUntil(By.xpath("//li[text()='All Operations']"));
    
        const options = await operationFilter.findElement(By.xpath("//li[text()='All Operations']"));
        await wait(1000);
        await options.click();

        await waitUntil(getElementByXPath("union-head-SearchResult"));

        const unionNode = await webview.findWebElement(getElementByXPath("union-head-SearchResult"));
        const moreIcon = await unionNode.findElement(By.css(`[data-testid='filter-node-menu']`));
        await moreIcon.click();
        await waitUntil(getElementByXPath("show-subgraph-menu"));
        const showSub = await webview.findWebElement(getElementByXPath("show-subgraph-menu"));
        await showSub.click();

        await waitUntil(getElementByXPath("union-head-SearchResult"));
        await waitUntil(getElementByXPath("service-class-head-Droid"));
        await waitUntil(getElementByXPath("service-class-head-Human"));
        await waitUntil(getElementByXPath("service-class-head-Starship"));
        await waitUntil(getElementByXPath("interface-head-Character"));
        await waitUntil(getElementByXPath("enum-head-Episode"));
    });
});
