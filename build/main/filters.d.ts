export declare const mapFilterType: (
  type: any,
  value: any,
  key: string
) => {
  [x: string]: {
    [x: string]: any
  }
}
export declare const createFilter: (
  fields: any,
  type: any
) =>
  | {
      and: object[]
    }
  | undefined
