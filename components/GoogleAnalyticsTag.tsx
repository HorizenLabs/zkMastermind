import Script from "next/script";

const GoogleAnalyticsTag = () => {
  return (
    <>
      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-YKZ5ZKZZD5"
      ></Script>
      <Script id="gtag-script">
        {`window.dataLayer = window.dataLayer || [];
         function gtag(){dataLayer.push(arguments)}
         gtag('js', new Date());
         gtag('config', 'G-YKZ5ZKZZD5');`}
      </Script>
    </>
  );
};

export default GoogleAnalyticsTag;
