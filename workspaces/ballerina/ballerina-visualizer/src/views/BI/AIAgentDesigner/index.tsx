import { NodePosition } from "@wso2-enterprise/ballerina-core";

interface AIAgentDesignerProps {
    filePath: string;
    position: NodePosition;
}

export function AIAgentDesigner(props: AIAgentDesignerProps) {
    const { filePath, position } = props;
    return <div>AIAgentDesigner</div>;
}

export default AIAgentDesigner;