import Script from "next/script";

export default function GoogleAnalytics() {
  const id=process.env.NEXT_PUBLIC_GA_ID?.trim();
  if(!id)return null;
  return <>
    <Script id="gamevado-ga-init" strategy="afterInteractive">{`
      window.dataLayer = window.dataLayer || [];
      function gtag(){window.dataLayer.push(arguments);}
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', ${JSON.stringify(id).replace(/</g,"\\u003c")}, {
        allow_google_signals: false,
        allow_ad_personalization_signals: false
      });
    `}</Script>
    <Script id="gamevado-ga-loader" strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`}/>
  </>;
}
