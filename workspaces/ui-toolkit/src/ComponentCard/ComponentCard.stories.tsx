import React from 'react';
import { ComponentCard } from './ComponentCard';

export default {
    title: 'CardComponent',
    component: ComponentCard,
};

export const Component_Card = () =>
    <ComponentCard isAllowed={true} onClick={null} colors={{foreground: '#000', hoverBackground: '#f3f3f3', hoverBorder: '#e7e7e7'}} >
        <div>Test Card</div>
    </ComponentCard>;
