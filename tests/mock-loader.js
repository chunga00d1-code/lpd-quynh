export async function resolve(specifier, context, nextResolve) {
  if (specifier === 'cloudflare:workers') {
    return {
      shortCircuit: true,
      url: 'data:text/javascript,export const env = { DB: {} };'
    };
  }
  return nextResolve(specifier, context);
}
