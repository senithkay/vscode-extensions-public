import React from 'react';

export default function FieldActionWrapper({ children, ...props }: { children: React.ReactNode; [key: string]: any }) {
    return (
        <span data-field-action {...props}>
            {children}
        </span>
    );
}
