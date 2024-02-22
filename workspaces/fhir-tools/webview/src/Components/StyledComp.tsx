import styled from "@emotion/styled";
import { VSCodeProgressRing } from '@vscode/webview-ui-toolkit/react';

export const StatusMessage = styled.div({
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    padding: "10px",
    marginLeft: "8px",
    height: "90vh",
    fontSize: "16px"
});

export const SmallProgressRing = styled(VSCodeProgressRing)`
    height: 20px;
    width: 20px;
`;
