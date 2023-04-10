import * as Y from "yjs"
import EditorJS from "@editorjs/editorjs"
import { WebsocketProvider } from "y-websocket"
import { YDocEditorJSBinding } from "../src"

// (1) - Setup Y Doc...
const yDoc = new Y.Doc()
const provider = new WebsocketProvider("ws://localhost:1234", "docId", yDoc)
// you can add other providers here too - we're just using WS to prove collaboration works in multiple browser tabs

// (2) - Setup Y Doc + Editor JS binding...
const binding = new YDocEditorJSBinding(yDoc.getArray("docId"))

// (3) - Setup Editor JS
const editor = new EditorJS({
    holder: document.getElementById("editor-js"),

    // Hook in our binding listener into Editor JS
    onChange: (api, event: CustomEvent) => {
        binding.onBlockEventEditorJS(api, event)
    },
})

// (4) - Finally, initialise our binding with the editor
binding.bindEditor(editor)
