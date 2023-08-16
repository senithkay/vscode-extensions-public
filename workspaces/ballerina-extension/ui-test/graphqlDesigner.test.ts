import { before, describe } from "mocha";
import { join } from "path";
import { By, EditorView, Key, VSBrowser, WebDriver, WebView } from "vscode-extension-tester";
import { getElementByXPathUsingTestID, switchToIFrame, wait, waitUntil } from "./util";
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
        await waitUntil(getElementByXPathUsingTestID("graphql-canvas-widget"));
    });

    it('Verify graphql root node and its fields ', async () => {
        await waitUntil(getElementByXPathUsingTestID("graphql-root-head-/graphql2"));

        await waitUntil(getElementByXPathUsingTestID("resource-identifier-hero"));
        await waitUntil(getElementByXPathUsingTestID("resource-type-Character!"));

        await waitUntil(getElementByXPathUsingTestID("resource-identifier-reviews"));
        await waitUntil(getElementByXPathUsingTestID("resource-type-[Review]!"));

        await waitUntil(getElementByXPathUsingTestID("resource-identifier-characters"));
        await waitUntil(getElementByXPathUsingTestID("resource-type-[Character]!"));

        await waitUntil(getElementByXPathUsingTestID("resource-identifier-droid"));
        await waitUntil(getElementByXPathUsingTestID("resource-type-Droid"));

        await waitUntil(getElementByXPathUsingTestID("resource-identifier-human"));
        await waitUntil(getElementByXPathUsingTestID("resource-type-Human"));

        await waitUntil(getElementByXPathUsingTestID("resource-identifier-starship"));
        await waitUntil(getElementByXPathUsingTestID("resource-type-Starship"));

        await waitUntil(getElementByXPathUsingTestID("resource-identifier-search"));
        await waitUntil(getElementByXPathUsingTestID("resource-type-[SearchResult!]"));

        await waitUntil(getElementByXPathUsingTestID("resource-identifier-starship"));
        await waitUntil(getElementByXPathUsingTestID("resource-type-Starship"));

        await waitUntil(getElementByXPathUsingTestID("resource-identifier-reviewAdded"));
        await waitUntil(getElementByXPathUsingTestID("resource-type-Review!"));

        await waitUntil(getElementByXPathUsingTestID("remote-identifier-createReview"));
        await waitUntil(getElementByXPathUsingTestID("remote-type-Review!"));

        await waitUntil(getElementByXPathUsingTestID("resource-identifier-profile"));
        await waitUntil(getElementByXPathUsingTestID("resource-type-profile!"));
    });

    it('Verify record nodes and fields', async () => {
        await waitUntil(getElementByXPathUsingTestID("record-head-Review"));

        await waitUntil(getElementByXPathUsingTestID("record-field-name-episode"));
        await waitUntil(getElementByXPathUsingTestID("record-field-type-Episode!"));

        await waitUntil(getElementByXPathUsingTestID("record-field-name-stars"));
        await waitUntil(getElementByXPathUsingTestID("record-field-type-Int!"));

        await waitUntil(getElementByXPathUsingTestID("record-field-name-commentary"));
        await waitUntil(getElementByXPathUsingTestID("record-field-type-String"));
    });

    it('Verify enum nodes and fields', async () => {
        await waitUntil(getElementByXPathUsingTestID("enum-head-Episode"));

        await waitUntil(getElementByXPathUsingTestID("enum-field-JEDI"));
        await waitUntil(getElementByXPathUsingTestID("enum-field-EMPIRE"));
        await waitUntil(getElementByXPathUsingTestID("enum-field-NEWHOPE"));
    });

    it('Verify service nodes and fields', async () => {
        await waitUntil(getElementByXPathUsingTestID("service-class-head-Droid"));

        await waitUntil(getElementByXPathUsingTestID("service-field-id"));
        await waitUntil(getElementByXPathUsingTestID("service-field-type-String"));

        await waitUntil(getElementByXPathUsingTestID("service-field-name"));
        await waitUntil(getElementByXPathUsingTestID("service-field-type-String"));

        await waitUntil(getElementByXPathUsingTestID("service-field-friends"));
        await waitUntil(getElementByXPathUsingTestID("service-field-type-[Character!]!"));

        await waitUntil(getElementByXPathUsingTestID("service-field-appearsIn"));
        await waitUntil(getElementByXPathUsingTestID("service-field-type-[Episode!]!"));

        await waitUntil(getElementByXPathUsingTestID("service-field-primaryFunction"));
        await waitUntil(getElementByXPathUsingTestID("service-field-type-String"));

        await waitUntil(getElementByXPathUsingTestID("service-class-head-Human"));
        await waitUntil(getElementByXPathUsingTestID("service-class-head-Starship"));
    });

    it('Verify interface nodes and fields', async () => {
        await waitUntil(getElementByXPathUsingTestID("interface-head-Character"));

        await waitUntil(getElementByXPathUsingTestID("interface-func-id"));
        await waitUntil(getElementByXPathUsingTestID("interface-func-type-String!"));

        await waitUntil(getElementByXPathUsingTestID("interface-func-name"));
        await waitUntil(getElementByXPathUsingTestID("interface-func-type-String!"));

        await waitUntil(getElementByXPathUsingTestID("interface-func-friends"));
        await waitUntil(getElementByXPathUsingTestID("interface-func-type-[Character!]!"));

        await waitUntil(getElementByXPathUsingTestID("interface-func-appearsIn"));
        await waitUntil(getElementByXPathUsingTestID("interface-func-type-[Episode!]!"));

        await waitUntil(getElementByXPathUsingTestID("interface-implementation-Human"));
        await waitUntil(getElementByXPathUsingTestID("interface-implementation-Droid"));
    });

    it('Verify union nodes and fields', async () => {
        await waitUntil(getElementByXPathUsingTestID("union-head-SearchResult"));

        await waitUntil(getElementByXPathUsingTestID("union-field-Human"));
        await waitUntil(getElementByXPathUsingTestID("union-field-Droid"));
        await waitUntil(getElementByXPathUsingTestID("union-field-Starship"));
    });

    it('Verify hierarchical resource nodes and fields', async () => {
        await waitUntil(getElementByXPathUsingTestID("hierarchical-head-profile"));

        await waitUntil(getElementByXPathUsingTestID("hierarchical-field-quote"));
        await waitUntil(getElementByXPathUsingTestID("hierarchical-field-type-String!"));
        await waitUntil(getElementByXPathUsingTestID("hierarchical-field-name"));
        await waitUntil(getElementByXPathUsingTestID("hierarchical-field-type-name!"));

        await waitUntil(getElementByXPathUsingTestID("hierarchical-head-name"));

        await waitUntil(getElementByXPathUsingTestID("hierarchical-field-first"));
        await waitUntil(getElementByXPathUsingTestID("hierarchical-field-type-String!"));
        await waitUntil(getElementByXPathUsingTestID("hierarchical-field-last"));
        await waitUntil(getElementByXPathUsingTestID("hierarchical-field-type-String!"));
    });

    it('Verify links', async () => {
        await waitUntil(getElementByXPathUsingTestID("right-search-left-SearchResult"));
        await waitUntil(getElementByXPathUsingTestID("right-hero-left-Character"));
        await waitUntil(getElementByXPathUsingTestID("right-reviewAdded-left-Review"));
        await waitUntil(getElementByXPathUsingTestID("right-starship-left-Starship"));
        await waitUntil(getElementByXPathUsingTestID("right-human-left-Human"));
        await waitUntil(getElementByXPathUsingTestID("right-appearsIn-left-Episode"));
        await waitUntil(getElementByXPathUsingTestID("right-Starship-left-Starship"));
    });

    it('Verify filtering of operations', async () => {
        const nodeFilter = await webview.findWebElement(getElementByXPathUsingTestID("operation-filter"));

        await nodeFilter.click();
        // Wait for the dropdown to fully expand and the menu items to be visible
        await waitUntil(By.xpath("//li[text()='Mutations']"));

        const options = await nodeFilter.findElement(By.xpath("//li[text()='Mutations']"));
        await wait(1000);
        await options.click();

        await waitUntil(getElementByXPathUsingTestID("graphql-root-head-/graphql2"));
        await waitUntil(getElementByXPathUsingTestID("remote-identifier-createReview"));
        await waitUntil(getElementByXPathUsingTestID("record-head-Review"));
        await waitUntil(getElementByXPathUsingTestID("enum-head-Episode"));

        await nodeFilter.click();
        // Wait for the dropdown to fully expand and the menu items to be visible
        await waitUntil(By.xpath("//li[text()='Subscriptions']"));

        const subOption = await nodeFilter.findElement(By.xpath("//li[text()='Subscriptions']"));
        // wait added to avoid intermittent failure when selecting the dropdown
        await wait(1000);
        await subOption.click();

        await waitUntil(getElementByXPathUsingTestID("graphql-root-head-/graphql2"));
        await waitUntil(getElementByXPathUsingTestID("resource-identifier-reviewAdded"));
        await waitUntil(getElementByXPathUsingTestID("record-head-Review"));
        await waitUntil(getElementByXPathUsingTestID("enum-head-Episode"));
    });

    it('verify filtering of nodes', async () => {
        const nodeFilter = await webview.findWebElement(By.xpath("//input[@value='/graphql2']"));

        await nodeFilter.click();
        await nodeFilter.sendKeys("Human", Key.DOWN, Key.ENTER);

        await waitUntil(getElementByXPathUsingTestID("service-class-head-Human"));
        await waitUntil(getElementByXPathUsingTestID("service-class-head-Droid"));
        await waitUntil(getElementByXPathUsingTestID("interface-head-Character"));
        await waitUntil(getElementByXPathUsingTestID("enum-head-Episode"));
        await waitUntil(getElementByXPathUsingTestID("service-class-head-Starship"));
    });

    it('verify subGraph filtering', async () => {
        const nodeFilter = await webview.findWebElement(By.xpath("//input[@value='Human']"));
        await nodeFilter.clear();
        const clearBtn = await nodeFilter.findElement(By.xpath("//*[@title='Clear']"));
        await clearBtn.click();

        await nodeFilter.sendKeys("/graphql2", Key.DOWN, Key.ENTER);

        const operationFilter = await webview.findWebElement(getElementByXPathUsingTestID("operation-filter"));
        await operationFilter.click();
        await waitUntil(By.xpath("//li[text()='All Operations']"));

        const options = await operationFilter.findElement(By.xpath("//li[text()='All Operations']"));
        await wait(1000);
        await options.click();

        await waitUntil(getElementByXPathUsingTestID("union-head-SearchResult"));

        const unionNode = await webview.findWebElement(getElementByXPathUsingTestID("union-head-SearchResult"));
        const moreIcon = await unionNode.findElement(By.css(`[data-testid='filter-node-menu']`));
        await moreIcon.click();
        await waitUntil(getElementByXPathUsingTestID("show-subgraph-menu"));
        const showSub = await webview.findWebElement(getElementByXPathUsingTestID("show-subgraph-menu"));
        await showSub.click();

        await waitUntil(getElementByXPathUsingTestID("union-head-SearchResult"));
        await waitUntil(getElementByXPathUsingTestID("service-class-head-Droid"));
        await waitUntil(getElementByXPathUsingTestID("service-class-head-Human"));
        await waitUntil(getElementByXPathUsingTestID("service-class-head-Starship"));
        await waitUntil(getElementByXPathUsingTestID("interface-head-Character"));
        await waitUntil(getElementByXPathUsingTestID("enum-head-Episode"));
    });
});
