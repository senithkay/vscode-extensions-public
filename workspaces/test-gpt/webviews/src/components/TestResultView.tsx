
import React, { useState } from "react";
import { VSCodeBadge, VSCodeButton, VSCodeTextArea } from '@vscode/webview-ui-toolkit/react';
import { TestResult } from "../ConsoleAPI";
import styled from "@emotion/styled";
import { Codicon } from "../Codicon/Codicon";

const colors = {
    "GET": '#3d7eff',
    "PUT": '#49cc90',
    "POST": '#fca130',
    "DELETE": '#f93e3e',
    "PATCH": '#986ee2',
}

function getColorByMethod(method: string) {
    switch (method) {
        case "GET":
            return colors.GET;
        case "PUT":
            return colors.PUT;
        case "POST":
            return colors.POST;
        case "DELETE":
            return colors.DELETE;
        case "PATCH":
            return colors.PATCH;
        default:
            return '#FFF'; // Default color
    }
}


const Method = styled.div({
    display: 'inline-block',
    fontWeight: "bolder",
    padding: "4px 20px 4px 0"
});


const TestResultBlock = styled.div<{ isExpanded: boolean }>(({ isExpanded }) => ({
    margin: "10px",
    backgroundColor: isExpanded ? "var(--vscode-sideBar-background)" : "none"
}));

const TestResultHeader = styled.div({
    cursor: "pointer",
    "&:hover": {
        backgroundColor: "var(--list-hover-background)"
    }
});

const RequestPanel = styled.div({
    padding: '10px',
    backgroundColor: 'var(--vscode-sideBar-background)'
});

const TestResult = ({ log }: { log: TestResult }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpansion = () => {
        setIsExpanded(!isExpanded);
    };
    // Your code here
    return (
        <TestResultBlock isExpanded={isExpanded}>
            <TestResultHeader onClick={toggleExpansion} style={{ padding: "5px 0 5px 0" }}>
                <VSCodeBadge style={{ marginRight: "10px", marginLeft: "10px" }}>{log.output.code}</VSCodeBadge>
                <Method style={{ color: getColorByMethod(log.request.method), width: "30px" }}>{log.request.method}</Method>
                <span>{log.request.path}</span>
                {isExpanded ?
                    <VSCodeButton appearance="icon" style={{ float: "right", marginRight: "10px" }}>
                        <Codicon name="chevron-up" />
                    </VSCodeButton> :
                    <VSCodeButton appearance="icon" style={{ float: "right", marginRight: "10px" }}>
                        <Codicon name="chevron-down" />
                    </VSCodeButton>}
            </TestResultHeader>
            {isExpanded && (
                <>
                    <RequestPanel>
                        {log.request.inputs.requestBody &&
                            <>
                                <h4 style={{ margin: "0 0 5px 0" }}>Request Body</h4>
                                <VSCodeTextArea
                                    style={{ fontFamily: "monospace", width: "100%", marginBottom: "10px" }}
                                    value={JSON.stringify(log.request.inputs.requestBody, null, 2)}
                                    rows={calculateNumberOfLines(JSON.stringify(log.request.inputs.requestBody, null, 2))}
                                    readOnly={true}>
                                </VSCodeTextArea>
                            </>
                        }
                        <h4 style={{ margin: "0 0 5px 0" }}>Response Payload</h4>
                        <VSCodeTextArea
                            style={{ fontFamily: "monospace", width: "100%" }}
                            value={JSON.stringify(log.output.payload, null, 2)}
                            rows={calculateNumberOfLines(JSON.stringify(log.output.payload, null, 2))}
                            readOnly={true}>
                        </VSCodeTextArea>
                    </RequestPanel>
                </>
            )}
        </TestResultBlock>
    );
};

export default TestResult;

const calculateNumberOfLines = (str: string): number => {
    const lines = str.split('\n');
    if (lines.length > 25) {
        return 25;
    }
    return lines.length;
};
