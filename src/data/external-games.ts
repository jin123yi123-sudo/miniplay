export type ExternalLaunchType = 'external' | 'download';
export type ExternalGame = {
  slug: string;
  title: string;
  description: string;
  launchType: ExternalLaunchType;
  officialUrl: string;
  sourceUrl?: string;
  platforms: string[];
  licenseNote: string;
  status: 'draft' | 'approved';
};
export const externalGames: ExternalGame[] = [
  {slug:'veloren',title:'Veloren',description:'Open-source voxel fantasy RPG. Visit the official website for downloads and platform information.',launchType:'download',officialUrl:'https://veloren.net/',sourceUrl:'https://gitlab.com/veloren/veloren',platforms:['Windows','macOS','Linux'],licenseNote:'GPL-3.0; check distribution and asset terms.',status:'draft'},
  {slug:'microverse',title:'Microverse In Box',description:'Godot AI society simulation. View the original open-source demo and setup instructions.',launchType:'external',officialUrl:'https://github.com/KsanaDock/Microverse',sourceUrl:'https://github.com/KsanaDock/Microverse',platforms:['Desktop','Android'],licenseNote:'MIT code; third-party LimeZu asset rights require separate review.',status:'draft'},
  {slug:'moot-court-simulator',title:'Moot Court Simulator',description:'AI-powered courtroom simulation. Opens the creator’s web experience; model API may be required.',launchType:'external',officialUrl:'https://mootcourt.coze.site',sourceUrl:'https://github.com/StefanCHEN2026/moot-court-simulator',platforms:['Web'],licenseNote:'MIT; service availability and AI costs are controlled by the external provider.',status:'draft'},
];
export const approvedExternalGames = externalGames.filter(game=>game.status==='approved');
