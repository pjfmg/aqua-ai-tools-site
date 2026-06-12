import { useEffect, useMemo, useRef } from "react";
import { useLanguage } from "../i18n.jsx";

const ADSENSE_SCRIPT_SRC = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
const DEFAULT_AD_CLIENT =
  import.meta.env.VITE_ADSENSE_CLIENT || "ca-pub-8295677733502537";
const DEFAULT_AD_SLOT = import.meta.env.VITE_ADSENSE_SLOT || "8526175787";

function isLocalHost(hostname) {
  return (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    /^127\.\d+\.\d+\.\d+$/.test(hostname)
  );
}

function loadAdSenseScript(client) {
  if (typeof document === "undefined" || !client) return;

  const src = `${ADSENSE_SCRIPT_SRC}?client=${encodeURIComponent(client)}`;
  const existing = Array.from(document.scripts || []).find((script) => {
    const scriptSrc = String(script?.src || "");
    return scriptSrc === src || scriptSrc.startsWith(`${ADSENSE_SCRIPT_SRC}?client=`);
  });

  if (existing) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = src;
  script.crossOrigin = "anonymous";
  document.head.appendChild(script);
}

export default function AdStrip({
  label = "Publicidade",
  client = DEFAULT_AD_CLIENT,
  slot = DEFAULT_AD_SLOT,
  format = "auto",
}) {
  const { isEn } = useLanguage();
  const adRef = useRef(null);
  const adClient = useMemo(() => String(client || "").trim(), [client]);
  const adSlot = useMemo(() => String(slot || "").trim(), [slot]);
  const adFormat = useMemo(() => {
    const value = String(format || "").trim().toLowerCase();
    return value || "auto";
  }, [format]);
  const isTestAd = useMemo(() => {
    if (typeof window === "undefined") return false;
    return isLocalHost(String(window.location?.hostname || "").toLowerCase());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !adClient || !adSlot) return;

    loadAdSenseScript(adClient);

    const adElement = adRef.current;
    if (!adElement || adElement.getAttribute("data-aqua-ads-init") === "1") return;
    if (adElement.getAttribute("data-adsbygoogle-status")) return;

    adElement.setAttribute("data-aqua-ads-init", "1");

    window.setTimeout(() => {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn("AdSense could not render this slot.", error);
        }
      }
    }, 0);
  }, [adClient, adSlot, adFormat]);

  if (!adClient || !adSlot) return null;

  return (
    <section className="adsStrip" aria-label={isEn && label === "Publicidade" ? "Advertisement" : label}>
      <div className="adsStrip__inner">
        <div className="adsStrip__label">{isEn && label === "Publicidade" ? "Advertisement" : label}</div>
        <div className="adsStrip__slot">
          <ins
            ref={adRef}
            className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client={adClient}
            data-ad-slot={adSlot}
            data-ad-format={adFormat}
            data-adtest={isTestAd ? "on" : undefined}
            data-full-width-responsive="true"
          />
        </div>
      </div>
    </section>
  );
}
