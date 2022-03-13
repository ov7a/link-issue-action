export {}

declare global {
    interface Array<T> {
        uniqBy<U>(getter: (item: T) => U): T[]
        filterNotNull(): NonNullable<T>[]
    }
}

if (!Array.prototype.uniqBy) {
    Array.prototype.uniqBy = function <T, U>(this: T[], getter: (item: T) => U): T[] {
        const seen = new Set<U>()
        return this.filter(elem => {
            const transformed = getter(elem)
            const isDuplicate = seen.has(transformed)
            seen.add(transformed)
            return !isDuplicate
        })
    }
}

function notEmpty<TValue>(value: TValue): value is NonNullable<TValue> {
    return value !== null && value !== undefined
}

if (!Array.prototype.filterNotNull) {
    Array.prototype.filterNotNull = function <T>(this: T[]): NonNullable<T>[] {
        return this.filter(notEmpty)
    }
}
