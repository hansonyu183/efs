export function applyControllerStatePatch<TState extends Record<string, unknown>>(
 controller: { state?: TState } | undefined,
 patch: Partial<TState>,
): TState | undefined {
 if (!controller) return undefined
 controller.state = {
  ...(controller.state ?? {} as TState),
  ...patch,
 }
 return controller.state
}
