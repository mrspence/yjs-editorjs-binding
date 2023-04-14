import { Doc as YDoc } from "yjs"
import { YJSEditorJSBinding } from "./index"
import { v4 as uuidv4 } from "uuid"
import EditorJS from "@editorjs/editorjs"
import { omit } from "lodash/fp"

/**
 * Mock for Editor JS - `window.matchMedia`
 */
Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // Deprecated
        removeListener: jest.fn(), // Deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
})

/**
 * Test util - create Editor JS instance
 * @param onChange
 * @returns
 */
function createEditorJSInstance(onChange: null | any) {
    const holder = document.createElement("div")
    const editor = new EditorJS({
        holder,
        // @ts-ignore https://github.com/kulshekhar/ts-jest/issues/281
        logLevel: "ERROR",
        onChange: (api, event) => {
            if (onChange) {
                onChange(api, event)
            }
        },
    })
    return { editor, holder }
}

function createYDocInstance(name = "xxx") {
    const doc = new YDoc()
    return { doc, array: doc.getArray(name) }
}

function createEditorJSBlock(
    uuid: null | string = null,
    type: string = "paragraph",
    data = { text: "xxx" }
) {
    return {
        uuid: uuid ? uuid : uuidv4(),
        type,
        data,
    }
}

test("yDOC behaviour", () => {
    const { doc, array } = createYDocInstance()
    array.push([{ a: 2 }, { a: 4 }, { a: 8 }])

    expect(array.length).toBe(3)

    array.delete(1) // remove 2nd entry

    // check it has gone
    expect(array.length).toBe(2)
    expect(array.toArray().findIndex((item: { a: number }) => item.a === 4) > -1).toBe(false)

    // check other entries
    expect(array.toArray()).toStrictEqual([{ a: 2 }, { a: 8 }])
})

test("Binding", async () => {
    const { doc, array } = createYDocInstance()

    const block1 = createEditorJSBlock()
    const blockData = [block1]

    array.push(blockData)

    expect(array.length).toBe(1)

    const binding = new YJSEditorJSBinding(array)

    const { editor, holder } = createEditorJSInstance((api, event) => {
        binding.onBlockEventEditorJS(api, event)
    })
    await binding.bindEditor(editor)

    expect((await editor.save()).blocks.map(omit("id"))).toStrictEqual(blockData.map(omit("uuid")))

    // test Editor JS responds to inserts properly
    editor.blocks.insert("paragraph", { text: "aaa" }, null, 1, false)

    expect(await (await editor.save()).blocks).toHaveLength(2)
    expect(await (await editor.save()).blocks[1].data.text).toBe("aaa")
})
