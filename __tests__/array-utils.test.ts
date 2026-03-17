import {expect, test, describe} from '@jest/globals'
import '../src/array-utils'

describe('uniqBy', () => {
    test('should return empty array for empty input', () => {
        expect([].uniqBy(x => x)).toEqual([])
    })

    test('should return single element array unchanged', () => {
        expect([1].uniqBy(x => x)).toEqual([1])
    })

    test('should deduplicate by identity', () => {
        expect([1, 2, 2, 3, 1].uniqBy(x => x)).toEqual([1, 2, 3])
    })

    test('should deduplicate by property', () => {
        const input = [
            {id: 1, name: 'a'},
            {id: 2, name: 'b'},
            {id: 1, name: 'c'}
        ]
        expect(input.uniqBy(x => x.id)).toEqual([
            {id: 1, name: 'a'},
            {id: 2, name: 'b'}
        ])
    })

    test('should keep first occurrence when deduplicating', () => {
        const input = [{id: 1, val: 'first'}, {id: 1, val: 'second'}]
        expect(input.uniqBy(x => x.id)).toEqual([{id: 1, val: 'first'}])
    })

    test('should deduplicate strings by transformed value', () => {
        expect(['foo', 'bar', 'FOO'].uniqBy(x => x.toLowerCase())).toEqual(['foo', 'bar'])
    })
})

describe('filterNotNull', () => {
    test('should return empty array for empty input', () => {
        expect([].filterNotNull()).toEqual([])
    })

    test('should filter out null values', () => {
        expect([1, null, 2, null, 3].filterNotNull()).toEqual([1, 2, 3])
    })

    test('should filter out undefined values', () => {
        expect([1, undefined, 2, undefined, 3].filterNotNull()).toEqual([1, 2, 3])
    })

    test('should filter out both null and undefined', () => {
        expect([null, 1, undefined, 2, null].filterNotNull()).toEqual([1, 2])
    })

    test('should return unchanged array with no nullish values', () => {
        expect([1, 2, 3].filterNotNull()).toEqual([1, 2, 3])
    })

    test('should keep falsy non-null values like 0 and empty string', () => {
        expect([0, '', false, null, undefined].filterNotNull()).toEqual([0, '', false])
    })
})
