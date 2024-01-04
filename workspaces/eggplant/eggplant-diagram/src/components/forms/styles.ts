/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import styled from "@emotion/styled";
import { TextField, Button, Dropdown } from "@wso2-enterprise/ui-toolkit";
import { Colors } from "../../resources";

export namespace Form {
    export const Tray = styled.div`
        width: 240px;
        background: ${Colors.SURFACE};
        padding: 16px 18px;
        display: flex;
        flex-direction: column;
        flex-grow: 0;
        flex-shrink: 0;
        gap: 6px;
        max-height: calc(100vh - 20px);
        overflow-y: auto;
    `;

    export const HeaderContainer = styled.div`
        display: flex;
        justify-content: space-between;
    `;

    export const Header = styled.h4`
        font-family: "GilmerMedium";
        font-family: var(--font-family);
        color: ${Colors.ON_SURFACE};
        margin-bottom: 12px;
        margin-block-start: unset;
        user-select: none;
    `;

    export const SectionTitle = styled.h4`
        font-family: "GilmerMedium";
        font-family: var(--font-family);
        font-weight: normal;
        color: ${Colors.ON_SURFACE};
        margin-bottom: 4px;
        margin-block-start: unset;
        user-select: none;
    `;

    export const Text = styled.p`
        font-family: "GilmerMedium";
        font-family: var(--font-family);
        font-weight: normal;
        color: ${Colors.ON_SURFACE};
        margin-bottom: 4px;
        margin-block-start: unset;
        user-select: none;
    `;

    export const Divider = styled.div`
        height: 1px;
        width: 100%;
        background: ${Colors.OUTLINE};
        margin: 6px 0px;
    `;

    export const Row = styled.div`
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 6px;
    `;

    export const Error = styled.div`
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 6px;
        color: ${Colors.ERROR};
        padding: 4px 0px;
    `;

    export const InputField = styled(TextField)`
        width: 100%;
    `;

    export const ActionButtonContainer = styled.div`
        position: sticky;
        bottom: 0;
        padding-top: 16px;
        background: ${Colors.SURFACE};
        width: 100%;
        & vscode-button {
            width: 100%;
        }
    `;

    export const ActionButton = styled(Button)`
        width: 100%;
    `;

    export const Select: any = styled(Dropdown)`
        & label {
            font-family: var(--font-family);
            outline: none;
            user-select: none;
            font-size: var(--type-ramp-base-font-size);
            line-height: var(--type-ramp-base-line-height);
        }
    `;
}
