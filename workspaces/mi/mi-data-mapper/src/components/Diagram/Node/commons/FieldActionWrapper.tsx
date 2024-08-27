import React from 'react';

export default function FieldActionWrapper({ children }: { children: React.ReactNode }) {
    return (
        <div data-field-action>
            {children}
        </div>
    );
}