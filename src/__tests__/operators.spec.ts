/* tslint:disable:no-expression-statement */
import { mapFilterType } from '../filters'
import { likeInsensitive } from '../operators'

describe('operators', () => {
  it('should parse and format for likeInsensitive operator', () => {
    const enteredValue = 'ilike value'
    const parsedValue = likeInsensitive.parse(enteredValue)
    const formattedValue = likeInsensitive.format(parsedValue)

    expect(parsedValue).toMatchSnapshot()
    expect(formattedValue).toMatchSnapshot()
  })
})
