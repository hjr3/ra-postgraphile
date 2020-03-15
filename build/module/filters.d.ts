export declare const mapFilterType: (
  type: any,
  value: any,
  key: string
) =>
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
  | {
      [x: string]: {
        in: any[]
      }
      or?: undefined
    }
  | {
      [x: string]: {
        equalTo: any
      }
      or?: undefined
    }
export declare const createFilter: (
  fields: any,
  type: any
) =>
  | {
      and: object[]
    }
  | undefined
