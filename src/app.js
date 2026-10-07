import { createProjectStore } from './features/projects/store.js';
import { mountWorkspace } from './features/projects/workspace.js';
import { mountEditor } from './features/editor/controller.js';
import { browserStorage } from './infrastructure/project-storage.js';
import { createNotifier } from './shared/browser.js';

// Compose dependencies here so feature modules do not create competing stores.
const notify = createNotifier(document.querySelector('#toast'));
const store = createProjectStore(browserStorage(), { onStorageError: notify });
const editor = mountEditor({ store, notify });
mountWorkspace({ store, notify, onOpenWebsite: editor.open });
