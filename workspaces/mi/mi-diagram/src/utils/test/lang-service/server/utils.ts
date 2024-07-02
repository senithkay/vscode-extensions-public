export function detectJavaHome(): string {
    const { JAVA_HOME } = process.env;
    if (!JAVA_HOME) {
        throw new Error("JAVA_HOME is not set");
    }
    return JAVA_HOME;
}
