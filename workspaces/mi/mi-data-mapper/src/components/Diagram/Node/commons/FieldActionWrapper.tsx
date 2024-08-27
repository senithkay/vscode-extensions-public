import React from 'react';

export default function FieldActionWrapper({ children }: { children: React.ReactNode }) {
    return (
        <span data-field-action>
            {children}
        </span>
    );
}