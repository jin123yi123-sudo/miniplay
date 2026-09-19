import type{Metadata}from'next';import{LocaleProvider}from'@/i18n/LocaleContext';import{localizedMetadata}from'@/i18n/metadata';
export const metadata:Metadata=localizedMetadata('zh-CN','/','GameVado - 免费在线浏览器小游戏','无需下载或注册，直接在 GameVado 畅玩益智、街机、纸牌和休闲小游戏。');
export default function ZhLayout({children}:{children:React.ReactNode}){return <LocaleProvider locale="zh-CN"><div lang="zh-CN" className="locale-zh">{children}</div></LocaleProvider>}
