export function formatForConfigurable(value: string): string {
    return `$config:${value}`;
}
  
export function removeConfigurableFormat(formattedValue: string): string {
    const prefix = "$config:";
    if (formattedValue.startsWith(prefix)) {
        return formattedValue.slice(prefix.length);
    }
    return formattedValue;
}

export function isConfigurable(value: string): boolean {
    const pattern = /^\$config:/;
    return pattern.test(value);
}

export function isCertificateFileName(value: string): boolean {
    const certificateExtension = ".crt";
    return value.endsWith(certificateExtension);
}
