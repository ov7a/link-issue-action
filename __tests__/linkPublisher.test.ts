import { expect, test } from '@jest/globals'
import { addLinks, getInserter } from "../src/linkPublisher"

test('should insert links at the beginning', async () => {
    const text = "Some pr description bla\n\nbla bla"
    const inserter = getInserter('start')
    const result = addLinks(text, ["https://example.com/1234", "https://ov7a.github.io/"], "Related issue", inserter)
    expect(result).toEqual("[Related issue](https://example.com/1234)\n\n[Related issue](https://ov7a.github.io/)\n\nSome pr description bla\n\nbla bla")
})

test('should insert links at the end', async () => {
    const text = "Some pr description bla\n\nbla bla"
    const inserter = getInserter('end')
    const result = addLinks(text, ["https://example.com/1234", "https://ov7a.github.io/"], "Related issue", inserter)
    expect(result).toEqual("Some pr description bla\n\nbla bla\n\n[Related issue](https://example.com/1234)\n\n[Related issue](https://ov7a.github.io/)")
})

test('should not insert link if it is already in text', async () => {
    const text = "Some pr description bla\n\nbla bla\n\n[Related issue](https://example.com/1234)\n\nAnd maybe some other text"
    const inserter = getInserter('end')
    const result = addLinks(text, ["https://example.com/1234", "https://ov7a.github.io/"], "Related issue", inserter)
    expect(result).toEqual("Some pr description bla\n\nbla bla\n\n[Related issue](https://example.com/1234)\n\nAnd maybe some other text\n\n[Related issue](https://ov7a.github.io/)")
})

test('should insert link with self as name if linkName is empty', async () => {
    const text = "Some pr description bla\n\nbla bla"
    const inserter = getInserter('end')
    const result = addLinks(text, ["https://example.com/1234", "https://ov7a.github.io/"], "", inserter)
    expect(result).toEqual("Some pr description bla\n\nbla bla\n\n[https://example.com/1234](https://example.com/1234)\n\n[https://ov7a.github.io/](https://ov7a.github.io/)")
})

test('should fail on unknown link location', async () => {
    expect(() => getInserter('I dont know')).toThrow("Invalid linkLocation: I dont know")
})