export const locales=['en','zh-CN'] as const;
export type Locale=typeof locales[number];
export const defaultLocale:Locale='en';
export const localePrefixes:Record<Locale,string>={en:'', 'zh-CN':'/zh'};
export function localizedPath(path:string,locale:Locale){const clean=path==='/'?'':path.startsWith('/')?path:`/${path}`;return `${localePrefixes[locale]}${clean}`||'/'}
export function pathWithoutLocale(path:string){if(path==='/zh')return'/';return path.startsWith('/zh/')?path.slice(3):path}
export function languageAlternates(path:string){const clean=pathWithoutLocale(path);return{en:localizedPath(clean,'en'),'zh-CN':localizedPath(clean,'zh-CN'),'x-default':localizedPath(clean,'en')}}

