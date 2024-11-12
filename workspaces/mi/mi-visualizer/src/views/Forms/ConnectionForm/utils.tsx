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