import React from "react";

export interface TypeBrowserProps {
    type?: string;
    onChange: (newType: string) => void;
}

export function TypeBrowser(props: TypeBrowserProps) {
    return (
        <div>type browser</div>
    );
}