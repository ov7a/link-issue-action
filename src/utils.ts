import { GitHub } from '@actions/github/lib/utils';

export type Octokit = InstanceType<typeof GitHub>

declare global {
    interface Array<T> {
        uniq(): T[];
        filterNotNull(): NonNullable<T>[];
    }
}

if (!Array.prototype.uniq) {
    Array.prototype.uniq = function <T>(this: T[]): T[] {
        const seen = new Set()
        return this.filter(elem => {
            const isDuplicate = seen.has(elem)
            seen.add(elem)
            return !isDuplicate
        })
    }
}

function notEmpty<TValue>(value: TValue): value is NonNullable<TValue> {
    return value !== null && value !== undefined;
}

if (!Array.prototype.filterNotNull) {
    Array.prototype.filterNotNull = function <T>(this: T[]): NonNullable<T>[] {
        return this.filter(notEmpty)
    }
}

