import { useEffect, useState } from "react";
import { hexToRGBA } from "../../../lib/hexToRGBA";

export default function InstallPWA(props) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const { template } = props || {};
  const { templateStyle,html_theme_id } = template || {};
  const { primary_color, tertiary_color } = templateStyle || {};

  let installStyle = { background: primary_color, color: tertiary_color }
if(html_theme_id=="22"){
  installStyle = {
    border: `.2rem solid ${primary_color}`,
  color: primary_color,
  backgroundColor: hexToRGBA(primary_color)
  }
}

  useEffect(() => {
    const handler = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    }
  };

  return (
    <div>
      {isInstallable && !isInstalled && (
        <button
          class="install-btn"
          style={installStyle}
          onClick={handleInstallClick}
        >
          Install App
        </button>
      )}
    </div>
  );
}
