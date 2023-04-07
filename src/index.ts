import EditorJS, { API } from "@editorjs/editorjs"
import { createMutex } from "./utils/mutex"
import { v4 as uuidv4 } from "uuid"
import { Array as YArray } from "yjs"

export class YDocEditorJSBinding {
    editor?: EditorJS
    private ydocArray: YArray<any>
    private internalStore = new Map()
    private mutex
    private isReady: boolean

    constructor(ydocArray) {
        this.ydocArray = ydocArray
        this.mutex = createMutex()
        this.isReady = false
    }

    /**
     * Initialize our binding with Editor JS and Y doc array.
     * @param editor
     */
    async initialize(editor) {
        this.editor = editor

        await this.editor.isReady

        this.initialRenderYdocToEditorJS()
        this.deeplyObserveYdocArray()

        this.isReady = true
    }

    /**
     * Listen to Editor JS `onChange(...)` block events and update our Y Doc array.
     * @param api
     * @param event
     * @returns
     */
    async onBlockEventEditorJS(api: API, event: CustomEvent) {
        if (this.isReady === false) return

        // Get index and UUID of changed block
        const index = event.detail.index
        const uuid =
            this.internalStoreAsArray.find((entry) => entry.index === index)?.editorBlock.uuid ||
            uuidv4() // get or generate a UUID

        const editorBlock = (await event.detail.target.save()) || {}

        // may be a new block created by Editor JS, so we make sure a UUID is assigned
        editorBlock.uuid = uuid
        event.detail.target.holder.setAttribute("data-y2-uuid", uuid)

        // handle event
        this.mutex(() => {
            switch (event.type) {
                case "block-added":
                    if (this.internalStore.has(uuid)) break

                    this.ydocArray.insert(index, [editorBlock])
                    this.internalStore.set(uuid, { index, editorBlock })
                    break

                case "block-removed":
                    if (!this.internalStore.has(uuid)) break

                    const removeIndex = this.ydocArray.toArray().findIndex((b) => b.uuid === uuid)
                    this.ydocArray.delete(removeIndex)
                    this.internalStore.delete(uuid)
                    break

                case "block-changed":
                    if (this.internalStore.has(uuid)) {
                        this.ydocArray.delete(index)
                    }

                    this.ydocArray.insert(index, [editorBlock])
                    this.internalStore.set(uuid, { index, editorBlock })
                    break
            }
        })
    }

    /**
     * Computed array version of our internalStore map
     */
    private get internalStoreAsArray() {
        return Array.from(this.internalStore.values())
    }

    /**
     * Initial pass at rendering Y doc to Editor JS. Only happens once, at the start.
     */
    private initialRenderYdocToEditorJS() {
        if (this.ydocArray.length === 0) {
            return
        }

        this.ydocArray
            .toArray()
            .forEach((editorBlock, index) => this.renderBlock(editorBlock, index))
    }

    /**
     * Listen to changes in our ydocArray
     */
    private deeplyObserveYdocArray() {
        this.ydocArray.observeDeep((eventArray, transaction) => {
            this.mutex(() => {
                for (const event of eventArray) {
                    // We're parsing the quill-delta object, which requires us to track the current block index as we loop through.
                    let index = 0

                    // parse and handle quill delta...
                    for (const delta of event.changes.delta) {
                        for (const [instruction, value] of Object.entries(delta)) {
                            switch (instruction) {
                                case "retain":
                                    index += value // skip to a block index...
                                    continue

                                case "insert":
                                    // insert 1 or more blocks...
                                    for (const editorBlock of value) {
                                        this.internalStore.set(editorBlock.uuid, {
                                            index,
                                            editorBlock,
                                        })
                                        this.renderBlock(editorBlock, index)

                                        index++ // update our current block index
                                    }

                                    continue

                                case "delete":
                                    // delete 1 or more blocks...
                                    for (let i = index; i < index + (value as number); i++) {
                                        const editorBlock = this.editor.blocks.getBlockByIndex(i)
                                        const uuid =
                                            editorBlock?.holder.getAttribute("data-y2-uuid") || null

                                        if (uuid === null) continue // ignore local changes where this won't exist

                                        this.editor.blocks.delete(i)
                                        this.internalStore.delete(uuid)
                                    }

                                    index += value as number // update our current block index
                                    continue
                            }
                        }
                    }
                }
            })
        })
    }

    /**
     * Render into Editor JS and track within our internalStore
     * @param editorBlock
     * @param index
     */
    private renderBlock(editorBlock, index) {
        this.editor.blocks.insert(editorBlock.type, editorBlock.data, null, index, false)
        const blockApi = this.editor.blocks.getBlockByIndex(index)
        blockApi.holder.setAttribute("data-y2-uuid", editorBlock.uuid)
        this.internalStore.set(editorBlock.uuid, { index, blockApi, editorBlock })
    }
}
