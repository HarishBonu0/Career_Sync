declare module 'date-fns' {
  export function format(
    date: Date | number,
    formatString: string,
    options?: unknown
  ): string
}