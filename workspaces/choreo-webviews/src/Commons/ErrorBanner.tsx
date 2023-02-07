/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 * 
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
 */

import { css, cx } from "@emotion/css";
import styled from "@emotion/styled";

const Container = styled.div`
    align-items: center;
    display: flex;
    flex-direction: row;
    background-color: var(--vscode-toolbar-activeBackground);
    padding: 6px;
`;

const codiconStyles = css`
    color: var(--vscode-errorForeground);
    margin-right: 6px;
    vertical-align: middle;
`;

export function ErrorBanner(props: { errorMsg: string }) {
    const { errorMsg } = props;

    return (
        <Container>
            <i className={`codicon codicon-warning ${cx(codiconStyles)}`} />
            {errorMsg}
        </Container>
    );
}
