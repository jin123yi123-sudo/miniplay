const normalizeUrl=(value:string)=>value.replace(/\/$/,"");
const configuredUrl=process.env.NEXT_PUBLIC_SITE_URL?.trim();
const configuredEmail=process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();

export const site={
  name:"MiniPlay",
  tagline:"Quick browser games for short breaks.",
  description:"Free, fast browser games that work instantly on phone, tablet, and desktop.",
  url:normalizeUrl(configuredUrl||"http://localhost:3000"),
  email:configuredEmail||"",
  isConfigured:Boolean(configuredUrl),
};

export const absoluteUrl=(path="/")=>new URL(path,`${site.url}/`).toString();

if(process.env.NODE_ENV==="production"&&!configuredUrl){
  console.warn("MiniPlay: NEXT_PUBLIC_SITE_URL is not set. Configure it before production deployment.");
}
