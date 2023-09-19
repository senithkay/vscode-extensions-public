interface Props {
    title?: string;
    subTitle?: string;
    buttonTitle: string;
    iconName?: string;
    variant?: 'primary' | 'secondary';
    onClick?: () => void;
    buttonDisabled?: boolean;
}
export declare const AlertBox: (props: Props) => JSX.Element;
export {};
