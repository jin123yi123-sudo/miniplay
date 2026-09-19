"use client";
import{createContext,useContext,useEffect}from'react';import type{Game}from'@/data/games';
import{dictionaries}from'./dictionary';import type{Locale}from'./config';import{localizeLegacyGameUi}from'./translate-game-ui';
type LocaleState={locale:Locale;currentGame?:Game;games?:Game[]};const LocaleContext=createContext<LocaleState>({locale:'en'});
export function LocaleProvider({locale,currentGame,games,children}:{locale:Locale;currentGame?:Game;games?:Game[];children:React.ReactNode}){useEffect(()=>{document.documentElement.lang=locale;return localizeLegacyGameUi(document.body,locale)},[locale]);return <LocaleContext.Provider value={{locale,currentGame,games}}>{children}</LocaleContext.Provider>}
export function useLocale(){return useContext(LocaleContext).locale}
export function useCurrentGame(fallback:Game){return useContext(LocaleContext).currentGame||fallback}
export function useLocalizedGames(fallback:Game[]){return useContext(LocaleContext).games||fallback}
export function useI18n(){const locale=useLocale();return{locale,t:dictionaries[locale]}}
