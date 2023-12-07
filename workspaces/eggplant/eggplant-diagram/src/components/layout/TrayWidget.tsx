import React from "react";
import styled from "@emotion/styled";
import { Colors } from "../../resources";

export interface TrayWidgetProps {
    children?: React.ReactNode;
}

namespace S {
    export const Tray = styled.div`
        min-width: 200px;
        background: ${Colors.SURFACE};
        flex-grow: 0;
        flex-shrink: 0;
        padding: 12px 4px;
    `;
}

export function TrayWidget(props: TrayWidgetProps) {
    const { children } = props;
    return <S.Tray>{children}</S.Tray>;
}
