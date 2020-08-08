import { FilterSpec } from '../types'
import { mapFilterType } from '../filters'

describe('filters', () => {
  it('should filter by String', () => {
    expect(
      mapFilterType(
        { kind: 'SCALAR', name: 'String', ofType: null },
        'value',
        'id'
      )
    ).toMatchSnapshot()
  })
  it('should filter using a FilterSpec', () => {
    const spec: FilterSpec = {
      operator: 'likeInsensitive',
      value: 'ilike value'
    }

    expect(
      mapFilterType(
        { kind: 'SCALAR', name: 'String', ofType: null },
        spec,
        'id'
      )
    ).toMatchSnapshot()
  })
  it('should filter by Int', () => {
    expect(
      mapFilterType({ kind: 'SCALAR', name: 'Int', ofType: null }, 5, 'id')
    ).toMatchSnapshot()
  })
  it('should filter by BigInt', () => {
    expect(
      mapFilterType(
        { kind: 'SCALAR', name: 'Int', ofType: null },
        BigInt(5),
        'id'
      )
    ).toMatchSnapshot()
  })
  it('should filter by UUID', () => {
    expect(
      mapFilterType(
        { kind: 'SCALAR', name: 'UUID', ofType: null },
        '02d07429-c2a7-4494-aec9-e8bde9176e86',
        'id'
      )
    ).toMatchSnapshot()
  })
  it('should filter with Full Text', () => {
    expect(
      mapFilterType(
        { kind: 'SCALAR', name: 'FullText', ofType: null },
        'test',
        'id'
      )
    ).toMatchSnapshot()
  })
  it('should support custom filters via objects', () => {
    const spec: FilterSpec = {
      operator: 'contains',
      value: ['a', 'b']
    }
    expect(
      mapFilterType(
        { kind: 'SCALAR', name: 'String', ofType: null },
        spec,
        'id'
      )
    ).toMatchSnapshot()
  })
  it('should throw an error if custom filter is not of type FilterSpec', () => {
    expect(() =>
      mapFilterType({ kind: 'SCALAR', name: 'String', ofType: null }, {}, 'id')
    ).toThrowErrorMatchingSnapshot()

    expect(() =>
      mapFilterType(
        { kind: 'SCALAR', name: 'String', ofType: null },
        { operator: 'equalTo', value: undefined },
        'id'
      )
    ).toThrowErrorMatchingSnapshot()

    expect(() =>
      mapFilterType(
        { kind: 'SCALAR', name: 'String', ofType: null },
        { operator: undefined, value: 'foo' },
        'id'
      )
    ).toThrowErrorMatchingSnapshot()
  })
})
