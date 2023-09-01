declare module 'nyc' {
  export class NYC {
    createTempDirectory(): Promise<void>
    writeCoverageFile(): Promise<void>
  }
}
