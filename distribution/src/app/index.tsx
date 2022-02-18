import { renderDiagramEditor } from "@wso2-enterprise/ballerina-low-code-editor";

const props: any = {};

renderDiagramEditor({
    target: document.getElementById("low-code-container"),
    editorProps: props
})