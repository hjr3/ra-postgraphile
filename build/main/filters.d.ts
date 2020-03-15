export declare const mapFilterType: (
  type: any,
  value: any,
  key: string
) =>
  | {
      [x: string]: any
      or?: undefined
    }
  | {
      or: (
        | {
            [x: string]: {
              equalTo: any
            }
          }
        | {
            [x: string]: {
              like: string
            }
          }
      )[]
    }
export declare const createFilter: (
  fields: any,
  type: any
) =>
  | {
      and: object[]
    }
  | undefined
