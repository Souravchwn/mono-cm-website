/**
 * Inlined into <head> (see layout.tsx) so the theme attribute is set before
 * first paint — without this, the page would flash the wrong theme for a
 * frame while React hydrates. Dark is the fallback brand default; light only
 * applies from a stored explicit choice or a clear system preference for light.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var s=localStorage.getItem('mono-cm-theme');var t=(s==='light'||s==='dark')?s:(window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;
