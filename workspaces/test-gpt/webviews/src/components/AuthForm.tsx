import React, { useState } from 'react';
import { VSCodeTextField, VSCodeButton, VSCodeDropdown } from '@vscode/webview-ui-toolkit/react';
import styled from '@emotion/styled';

const FormWrapper = styled.div({
    padding: "0px 20px 20px 20px"
});

type AuthFormProps = {
    onAuthSubmit: (authData: any) => void;
    onClose: () => void;
};

function AuthForm({ onAuthSubmit, onClose }: AuthFormProps) {

    const [authType, setAuthType] = useState('basic');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [token, setToken] = useState('');
    const [headerName, setHeaderName] = useState('');
    const [headerValue, setHeaderValue] = useState('');

    const handleAuthTypeChange = (event: any) => {
        setAuthType(event.target.value);
    };

    const handleUsernameChange = (event: any) => {
        setUsername(event.target.value);
    };

    const handlePasswordChange = (event: any) => {
        setPassword(event.target.value);
    };

    const handleTokenChange = (event: any) => {
        setToken(event.target.value);
    };

    const handleHeaderNameChange = (event: any) => {
        setHeaderName(event.target.value);
    };

    const handleHeaderValueChange = (event: any) => {
        setHeaderValue(event.target.value);
    };

    const handleSubmit = () => {
        let authData = {};

        if (authType === 'basic') {
            authData = {
                type: 'basic',
                username: username,
                password: password
            };
        } else if (authType === 'bearer') {
            authData = {
                type: 'bearer',
                token: token
            };
        } else if (authType === 'key') {
            authData = {
                type: 'key',
                headerName: headerName,
                headerValue: headerValue
            };
        }

        onAuthSubmit(authData);
    };

    const handleClose = () => {
        onClose();
    };

    return (
        <>
            <FormWrapper>
                <h3>Authentication Details</h3>
                <p>Select the authentication type:</p>

                <VSCodeDropdown value={authType} onChange={handleAuthTypeChange}>
                    <option value="basic">Authorization Basic</option>
                    <option value="bearer">Bearer</option>
                    <option value="key">API Key</option>
                </VSCodeDropdown>

                {authType === 'basic' && (
                    <>
                        <VSCodeTextField
                            value={username}
                            onInput={handleUsernameChange}
                            placeholder="Username"
                            style={{ width: '100%', marginBottom: "10px" }}
                        />
                        <VSCodeTextField
                            value={password}
                            onInput={handlePasswordChange}
                            placeholder="Password"
                            style={{ width: '100%', marginBottom: "10px" }}
                        />
                    </>
                )}

                {authType === 'bearer' && (
                    <>
                        <VSCodeTextField
                            value={token}
                            onInput={handleTokenChange}
                            placeholder="Token"
                            style={{ width: '100%', marginBottom: "10px" }}
                        />
                    </>
                )}

                {authType === 'key' && (
                    <>
                        <VSCodeTextField
                            value={headerName}
                            onInput={handleHeaderNameChange}
                            placeholder="Header Name"
                            style={{ width: '100%', marginBottom: "10px" }}
                        />
                        <VSCodeTextField
                            value={headerValue}
                            onInput={handleHeaderValueChange}
                            placeholder="Header Value"
                            style={{ width: '100%', marginBottom: "10px" }}
                        />
                    </>
                )}

                <VSCodeButton onClick={handleSubmit}>Submit</VSCodeButton>
                <VSCodeButton onClick={handleClose} appearance={"secondary"} style={{ marginLeft: "10px" }}>Close</VSCodeButton>
            </FormWrapper>
        </>
    );
}

export default AuthForm;