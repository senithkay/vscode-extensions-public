import React from "react";
import styled from "@emotion/styled";
import { Colors } from "../../resources";

export interface TrayWidgetProps {
    children?: React.ReactNode;
}

namespace S {
    export const Tray = styled.div`
        min-width: 180px;
        background: ${Colors.SURFACE};
        padding: 16px 18px;
        display: flex;
        flex-direction: column;
        flex-grow: 0;
        flex-shrink: 0;
        gap: 6px;
    `;

    export const Title = styled.h4`
        font-family: 'GilmerMedium';
        font-family: var(--font-family);
        color: ${Colors.ON_SURFACE};
        margin-bottom: 12px;
        margin-block-start: unset;
        user-select: none;
    `;
}

export function TrayWidget(props: TrayWidgetProps) {
    const { children } = props;
    return (
        <S.Tray>
            <S.Title>Core Components</S.Title>
            {children}
        </S.Tray>
    );
}
