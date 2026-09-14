const normalizeUrl=(value:string)=>value.replace(/\/$/,"");
const configuredUrl=process.env.NEXT_PUBLIC_SITE_URL?.trim();
const configuredEmail=process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();

export const site={
  name:"GameVado",
  tagline:"Free Browser Games, No Download",
  description:"Free browser games you can play instantly, no download required.",
  url:normalizeUrl(configuredUrl||"http://localhost:3000"),
  email:configuredEmail||"",
  isConfigured:Boolean(configuredUrl),
};

export const absoluteUrl=(path="/")=>new URL(path,`${site.url}/`).toString();

if(process.env.NODE_ENV==="production"&&!configuredUrl){
  console.warn("GameVado: NEXT_PUBLIC_SITE_URL is not set. Configure it before production deployment.");
}
