export function foundationShellState(viewModels) {
  return { modules: Object.keys(viewModels), online: typeof navigator === 'undefined' ? true : navigator.onLine };
}
