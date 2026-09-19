import type { CSSProperties } from 'react';
import type{Locale}from'@/i18n/config';

export type PieceArtwork = { name: string; symbol: string; asset?: string; light: string; dark: string };
export type Match3Theme = {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  pieces: readonly [PieceArtwork, PieceArtwork, PieceArtwork, PieceArtwork, PieceArtwork, PieceArtwork];
  specials: { row: string; column: string; bomb: string; color: string; rowSymbol: string; columnSymbol: string; bombSymbol: string; colorSymbol: string; rowAsset?:string; columnAsset?:string; bombAsset?:string; colorAsset?:string };
  palette: { background: string; board: string; border: string; accent: string; panel: string; text: string; muted: string; seal: string };
  artwork: { boardBackground?: string; gameBackground?: string; cover?: string };
  audio?: { matchBase?:number; win?:number[]; loss?:number[] };
  cover: { symbol: string; background: string };
  storageNamespace: string;
  analyticsSlug: string;
  boardLabel?: string;
  levelSelectCopy: string;
  obstacleName: string;
  powerCallout: string;
};

export type ThemeStyle = CSSProperties & Record<`--${string}`, string>;
export function themeStyle(theme: Match3Theme): ThemeStyle {
  return {
    '--match-bg': theme.palette.background,
    '--match-board': theme.palette.board,
    '--match-border': theme.palette.border,
    '--match-accent': theme.palette.accent,
    '--match-panel': theme.palette.panel,
    '--match-text': theme.palette.text,
    '--match-muted': theme.palette.muted,
    '--match-seal': theme.palette.seal,
    ...(theme.artwork.gameBackground ? { backgroundImage: `url(${theme.artwork.gameBackground})` } : {}),
  };
}

const zhThemes:Record<string,{name:string;tagline:string;pieces:string[];specials:[string,string,string,string];levelSelectCopy:string;obstacleName:string;powerCallout:string;boardLabel:string}>={
 'gem-match':{name:'宝石消消乐',tagline:'闪亮连锁，策略闯关。',pieces:['玫瑰宝石','琥珀宝石','日光宝石','翡翠宝石','蓝宝石','珍珠'],specials:['横向宝石','纵向宝石','爆破宝石','彩虹宝石'],levelSelectCopy:'选择关卡，完成收集、分数和障碍目标。',obstacleName:'封印',powerCallout:'宝石爆发！',boardLabel:'宝石消消乐棋盘'},
 'fruit-match':{name:'水果消消乐',tagline:'清爽水果，缤纷连锁。',pieces:['草莓','橙子','柠檬','青苹果','葡萄','蓝莓'],specials:['横向切割器','纵向切割器','水果爆破','彩虹果实'],levelSelectCopy:'装满果篮、清除木箱并完成水果订单。',obstacleName:'木箱',powerCallout:'水果爆发！',boardLabel:'水果消消乐棋盘'},
 'pet-match':{name:'萌宠消消乐',tagline:'可爱伙伴，轻松闯关。',pieces:['猫咪','狗狗','兔子','仓鼠','熊猫','狐狸'],specials:['横向飞奔萌宠','纵向飞奔萌宠','玩乐爆破','友谊之星'],levelSelectCopy:'收集萌宠、打开门栏并制造欢乐连锁。',obstacleName:'门栏',powerCallout:'玩乐爆破！',boardLabel:'萌宠消消乐棋盘'},
 'dessert-match':{name:'甜品消消乐',tagline:'缤纷甜品，层层组合。',pieces:['甜甜圈','纸杯蛋糕','饼干','冰淇淋','马卡龙','糖果'],specials:['横向上菜线','纵向上菜线','糖霜爆破','彩虹马卡龙'],levelSelectCopy:'完成甜品订单，清理托盘并赢得星级。',obstacleName:'托盘',powerCallout:'糖霜爆发！',boardLabel:'甜品消消乐棋盘'},
 'ocean-match':{name:'海洋消消乐',tagline:'潜入海底，发现连锁。',pieces:['小鱼','海星','贝壳','海马','章鱼','珍珠'],specials:['横向潮汐','纵向潮汐','泡泡爆破','彩虹珍珠'],levelSelectCopy:'收集海洋生物，清理礁石网并完成探险。',obstacleName:'礁石网',powerCallout:'泡泡爆发！',boardLabel:'海洋消消乐棋盘'},
 'space-match':{name:'太空消消乐',tagline:'穿越星空，规划宇宙连锁。',pieces:['行星','火箭','星星','外星徽记','卫星','流星'],specials:['横向激光行星','纵向激光行星','超新星','宇宙核心'],levelSelectCopy:'规划航线、打破力场并完成太空任务。',obstacleName:'力场',powerCallout:'超新星！',boardLabel:'太空消消乐棋盘'},
 'anime-match':{name:'动漫消消乐',tagline:'原创英雄，战术连锁。',pieces:['炎之先锋','潮汐织者','森之弓手','曙光守卫','暮影行者','星辰贤者'],specials:['横向英雄突击','纵向英雄突击','团队爆破','团结徽记'],levelSelectCopy:'集结原创英雄，清除结界并完成团队任务。',obstacleName:'奥术结界',powerCallout:'团队爆发！',boardLabel:'动漫消消乐棋盘'},
};
export function localizeTheme(theme:Match3Theme,locale:Locale):Match3Theme{if(locale==='en')return theme;const value=zhThemes[theme.slug];if(!value)return theme;return{...theme,name:value.name,tagline:value.tagline,pieces:theme.pieces.map((piece,index)=>({...piece,name:value.pieces[index]}))as unknown as Match3Theme['pieces'],specials:{...theme.specials,row:value.specials[0],column:value.specials[1],bomb:value.specials[2],color:value.specials[3]},levelSelectCopy:value.levelSelectCopy,obstacleName:value.obstacleName,powerCallout:value.powerCallout,boardLabel:value.boardLabel}}
