import { renderStandaloneMockedEditor } from "@wso2-enterprise/ballerina-low-code-editor";

(window as any).setImmediate = window.setTimeout;

renderStandaloneMockedEditor("/home/kavithlokuhewage/git/ballerina-low-code-editor/low-code-editor/src/stories/data/project/main.bal", "low-code-container");