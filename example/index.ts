import * as Y from "yjs"
import EditorJS from "@editorjs/editorjs"
import { WebsocketProvider } from "y-websocket"
import { YJSEditorJSBinding } from "../src"

// (1) - Setup Y Doc...
const yDoc = new Y.Doc()
const yArray = yDoc.getArray("docId")

// (Optional) Y providers
const provider = new WebsocketProvider("ws://localhost:1234", "docId", yDoc)
// you can add other providers here too - we're just using WS to prove collaboration works in multiple browser tabs

// (2) - Setup Y JS + Editor JS binding...
const binding = new YJSEditorJSBinding(yArray)

// (3) - Setup Editor JS
const editor = new EditorJS({
    holder: document.querySelector<HTMLElement>("#editor-js"),

    // Hook in our binding listener into Editor JS
    onChange: (api, event: CustomEvent) => {
        binding.onBlockEventEditorJS(api, event)
    },
})

// (4) - Finally, initialise our binding with the editor
binding.bindEditor(editor)
