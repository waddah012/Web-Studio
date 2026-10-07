# Repository references

Reviewed on October 7, 2026. These repositories informed the module boundaries. Web Studio does not include their source code or install their packages. Links point to upstream branches and may change over time.

| Repository | Relevant source or documentation | Applied idea |
| --- | --- | --- |
| [GrapesJS](https://github.com/GrapesJS/grapesjs) | [Core source modules](https://github.com/GrapesJS/grapesjs/tree/dev/packages/core/src), [getting started](https://github.com/GrapesJS/grapesjs/blob/dev/docs/getting-started.md) | Give storage, editor controls, and generated output distinct responsibilities |
| [Craft.js](https://github.com/prevwong/craft.js) | [Repository README](https://github.com/prevwong/craft.js#readme), [core source](https://github.com/prevwong/craft.js/tree/main/packages/core/src) | Represent saved editor content as serializable data and separate editor behavior from user components |
| [Puck](https://github.com/puckeditor/puck) | [Repository README](https://github.com/puckeditor/puck#readme) | Keep content configuration and rendering connected through a defined data contract |

## How this translates to Web Studio

GrapesJS has dedicated canvas, commands, storage, code, and other editor modules. Web Studio applies a smaller separation: the editor controller owns preview interactions; the project store owns commands; the storage adapter owns loading; the renderer owns HTML output.

Craft.js documents serializable editor state and customizable user components. Web Studio stores plain website data inside each project, rather than saving DOM nodes or form elements. This makes backups independent of the live interface.

Puck demonstrates an editor configured with components and data, with a renderer for the resulting content. Web Studio currently uses named templates and one fixed page renderer. A section registry would be a future extension, not a capability already implemented.

These projects solve broader problems and use different frameworks. Their monorepo sizes, dependencies, and APIs are not requirements for this repository. If their source is incorporated later, review the license at the exact revision and retain its required notices.
