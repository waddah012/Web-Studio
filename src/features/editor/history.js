// Store plain snapshots so undo never retains DOM nodes or mutates saved projects.
export function createHistory(initial, limit = 50) {
  let past = [];
  let present = structuredClone(initial);
  let future = [];
  let lastGroup;
  let lastTime = 0;
  return {
    get value() { return structuredClone(present); },
    get canUndo() { return past.length > 0; },
    get canRedo() { return future.length > 0; },
    record(next, { group, time = Date.now() } = {}) {
      if (JSON.stringify(next) === JSON.stringify(present)) return false;
      if (!group || group !== lastGroup || time - lastTime > 700 || future.length) {
        past.push(present);
        if (past.length > limit) past.shift();
      }
      present = structuredClone(next);
      future = [];
      lastGroup = group;
      lastTime = time;
      return true;
    },
    checkpoint() { lastGroup = undefined; lastTime = 0; },
    undo() {
      if (!past.length) return;
      future.push(present);
      present = past.pop();
      lastGroup = undefined;
    },
    redo() {
      if (!future.length) return;
      past.push(present);
      present = future.pop();
      lastGroup = undefined;
    },
  };
}
