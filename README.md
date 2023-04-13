# Editorjs binding for yjs

> THIS IS A WORK-IN-PROGRESS: I'm currently exploring the idea; below is the vision, time will tell 😉 - Matt

## Roadmap

-   [x] Working binding
-   [x] Add tooling (prettier and more)
-   [x] Tested binding
-   [ ] Add tooling (suitable NPM package generation)
-   [ ] Deem a stable(ish) beta release
-   [ ] Create first beta release on NPM
-   [ ] Open up to public for community testing and feedback
-   [ ] More testing/amends once initial bugs uncovered
-   [ ] Use in a private product / gather community issues and update beta release
-   [ ] Push stable release on NPM

There are no timelines for the moment, although I'm keen to quite quickly get this sorted over a period of weeks.

## Why?

Looking to utilise collaboration in a product that uses Editor JS. [hughfenghen/y-editorjs](https://github.com/hughfenghen/y-editorjs) is a fantastic starting point but needs a little more love that includes breaking changes. Mad credit to [hughfenghen](https://github.com/hughfenghen) for getting this on the road.

Decided not to create a pull request as we're in need of active development on this. Open to potentially merging in the future.

## Use

> BETA - This is still under active development

1. Import `yjs-editorjs-binding` package

| Package Manager | Command                         |
| --------------- | ------------------------------- |
| NPM             | `npm i yjs-editorjs-binding`    |
| Yarn            | `yarn add yjs-editorjs-binding` |
| PNPM            | `pnpm i yjs-editorjs-binding`   |

2. Use in your code, like the example below:

```typescript
import { Doc as YDoc } from "yjs"
import EditorJS from "@editorjs/editorjs"
import { YDocEditorJSBinding } from "yjs-editorjs-binding"

const yDoc = new YDoc()

const binding = new YDocEditorJSBinding(yDoc.getArray("docId"))

const editor = new EditorJS({
    holder: document.getElementById("editor-js"),

    // Hook in our binding listener into Editor JS
    onChange: (api, event: CustomEvent) => {
        binding.onBlockEventEditorJS(api, event)
    },
})

binding.bindEditor(editor)
```

## How to run this repo

1. Clone this repo
2. `pnpm i`
3. `pnpm run dev` and `pnpm run ws` (runs client and WS server)
4. Open http://localhost:8080 in two browser tabs and play

## Goals

-   Release a stable solution for Editor JS binding.
-   Encourage pull requests to continue the development of this yJS Editor JS Binding.

## Community

Pull requests and issues are highly encouraged and will be responded to rather quickly.

Like any Open Source project; this doesn't pay the bills! Consideration of that is expected in all community comms. We're in this together. 🔥
