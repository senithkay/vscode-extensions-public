import React from "react";

interface ActivitySectionProps {
    title: string;
}

export function ActivitySection(props: React.PropsWithChildren<ActivitySectionProps>) {
    const { title } = props;
    return (
        <div>
            <h1>{title}</h1>
            {props.children}
        </div>
    );
}
