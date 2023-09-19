import styled from "@emotion/styled";
import React from "react";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { Codicon } from "../../Codicon/Codicon";
const Container = styled.div `
    border-left: 0.3rem solid var(${props => props.variant === 'secondary' ? '--vscode-editorWidget-border' : '--vscode-focusBorder'});
    background: var(${props => props.variant === 'secondary' ? 'transparent' : '--vscode-inputValidation-infoBackground'});
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 1rem;
    gap: 12px;
    margin-bottom: 15px;
    width: -webkit-fill-available;
`;
const WideVSCodeButton = styled(VSCodeButton) `
    width: 100%;
    max-width: 300px;
    align-self: center;
`;
const Title = styled.div `
    color: var(--vscode-foreground);
    font-weight: 500;
`;
const SubTitle = styled.div `
    color: var(--vscode-descriptionForeground);
    font-size: 12px;
    font-weight: 400;
    line-height: 1.5;
`;
export const AlertBox = (props) => {
    const { title, buttonTitle, subTitle, iconName, variant = 'primary', buttonDisabled = false, onClick } = props;
    return (React.createElement(Container, { variant: variant },
        title && React.createElement(Title, null, title),
        subTitle && React.createElement(SubTitle, null, subTitle),
        React.createElement(WideVSCodeButton, { onClick: onClick, appearance: variant, disabled: buttonDisabled },
            iconName && (React.createElement(React.Fragment, null,
                React.createElement(Codicon, { name: iconName }),
                " \u00A0",
                " ")),
            buttonTitle)));
};
//# sourceMappingURL=AlertBox.js.map