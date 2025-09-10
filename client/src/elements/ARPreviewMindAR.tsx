import React, { useEffect, useRef, useState } from 'react';

interface CTA {
  label: string;
  action: 'link' | 'whatsapp' | 'tel' | 'mailto';
  value: string;
}

interface ARPreviewMindARProps {
  mindFileUrl?: string;
  posterUrl?: string;
  planeTextureUrl?: string;
  planeWidth?: number;
  planeHeight?: number;
  accent?: string;
  ctas?: CTA[];
}

export default function ARPreviewMindAR({
  mindFileUrl = '',
  posterUrl = '',
  planeTextureUrl = '',
  planeWidth = 0.8,
  planeHeight = 0.45,
  accent = '#0ea5e9',
  ctas = []
}: ARPreviewMindARProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isARLoaded, setIsARLoaded] = useState(false);
  const [arError, setArError] = useState<string | null>(null);
  const [showPoster, setShowPoster] = useState(true);

  // Load MindAR from CDN
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if MindAR is already loaded
    if ((window as any).MINDAR) {
      setIsARLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mind-ar@1.2.5/dist/mindar-image-aframe.prod.js';
    script.async = true;
    script.onload = () => {
      setIsARLoaded(true);
    };
    script.onerror = () => {
      setArError('Failed to load MindAR library');
    };
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Initialize AR scene when MindAR is loaded and mindFileUrl is available
  useEffect(() => {
    if (!isARLoaded || !mindFileUrl || !containerRef.current) return;

    const initAR = async () => {
      try {
        // Clear any existing content
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }

        // Create A-Frame scene
        const scene = document.createElement('a-scene');
        scene.setAttribute('mindar-image', `imageTargetSrc: ${mindFileUrl}; showStats: false; uiScanning: #scanning; uiError: #scanning; uiLoading: #scanning;`);
        scene.setAttribute('color-space', 'sRGB');
        scene.setAttribute('renderer', 'colorManagement: true, physicallyCorrectLights');
        scene.setAttribute('vr-mode-ui', 'enabled: false');
        scene.setAttribute('device-orientation-permission-ui', 'enabled: false');

        // Add assets
        const assets = document.createElement('a-assets');
        if (planeTextureUrl) {
          const img = document.createElement('img');
          img.id = 'card-texture';
          img.src = planeTextureUrl;
          img.crossOrigin = 'anonymous';
          assets.appendChild(img);
        }
        scene.appendChild(assets);

        // Add anchor with plane and CTA cube
        const anchor = document.createElement('a-entity');
        anchor.setAttribute('mindar-image-target', 'targetIndex: 0');

        // Create textured plane
        const plane = document.createElement('a-plane');
        plane.setAttribute('position', '0 0 0');
        plane.setAttribute('height', planeHeight.toString());
        plane.setAttribute('width', planeWidth.toString());
        plane.setAttribute('rotation', '-90 0 0');
        if (planeTextureUrl) {
          plane.setAttribute('material', `src: #card-texture; transparent: true; alphaTest: 0.5;`);
        } else {
          plane.setAttribute('material', `color: ${accent}; transparent: true; opacity: 0.8;`);
        }
        anchor.appendChild(plane);

        // Add small 3D CTA cube (clickable)
        if (ctas.length > 0) {
          const cube = document.createElement('a-box');
          cube.setAttribute('position', `${planeWidth * 0.4} 0.05 ${planeHeight * 0.3}`);
          cube.setAttribute('width', '0.1');
          cube.setAttribute('height', '0.05');
          cube.setAttribute('depth', '0.1');
          cube.setAttribute('material', `color: ${accent}; transparent: true; opacity: 0.9;`);
          cube.setAttribute('animation', 'property: rotation; to: 0 360 0; loop: true; dur: 3000;');
          
          // Add click event to cube
          cube.addEventListener('click', () => {
            handleCTAClick(ctas[0]);
          });
          
          anchor.appendChild(cube);
        }

        scene.appendChild(anchor);

        // Add scanning indicator
        const scanningDiv = document.createElement('div');
        scanningDiv.id = 'scanning';
        scanningDiv.style.cssText = `
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0,0,0,0.8);
          color: white;
          padding: 20px;
          border-radius: 10px;
          font-family: Arial, sans-serif;
          z-index: 1000;
          text-align: center;
        `;
        scanningDiv.innerHTML = `
          <div style="font-size: 18px; margin-bottom: 10px;">AR Scanner</div>
          <div style="font-size: 14px;">Point your camera at the business card</div>
        `;

        if (containerRef.current) {
          containerRef.current.appendChild(scene);
          containerRef.current.appendChild(scanningDiv);
        }

        // Hide poster when AR is active
        setShowPoster(false);

      } catch (error) {
        console.error('AR initialization error:', error);
        setArError('Failed to initialize AR scene');
      }
    };

    initAR();
  }, [isARLoaded, mindFileUrl, planeTextureUrl, planeWidth, planeHeight, accent, ctas]);

  const handleCTAClick = (cta: CTA) => {
    switch (cta.action) {
      case 'link':
        window.open(cta.value, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/${cta.value.replace(/[^\d]/g, '')}`, '_blank');
        break;
      case 'tel':
        window.location.href = `tel:${cta.value}`;
        break;
      case 'mailto':
        window.location.href = `mailto:${cta.value}`;
        break;
    }
  };

  const startAR = () => {
    if (!mindFileUrl) {
      setArError('No AR target file configured');
      return;
    }
    setShowPoster(false);
    // The AR scene will be initialized by the useEffect
  };

  if (arError) {
    return (
      <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ minHeight: '300px' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-6">
            <div className="text-red-500 text-xl mb-2">⚠️</div>
            <div className="text-gray-700 font-medium mb-2">AR Error</div>
            <div className="text-gray-500 text-sm">{arError}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ minHeight: '300px' }}>
      {/* AR Container */}
      <div 
        ref={containerRef} 
        className="absolute inset-0 w-full h-full"
        style={{ display: showPoster ? 'none' : 'block' }}
      />

      {/* Poster/Fallback View */}
      {showPoster && (
        <div className="absolute inset-0">
          {posterUrl ? (
            <img 
              src={posterUrl} 
              alt="AR Preview" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-4xl mb-4">📱</div>
                <div className="text-xl font-bold mb-2">AR Business Card</div>
                <div className="text-sm opacity-90">Point camera to view in AR</div>
              </div>
            </div>
          )}
          
          {/* Overlay CTA Box */}
          <div 
            className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-300"
            onClick={startAR}
          >
            <div 
              className="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-4 shadow-lg border-2"
              style={{ borderColor: accent }}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">📷</div>
                <div className="font-semibold text-gray-800 mb-1">Start AR Experience</div>
                <div className="text-sm text-gray-600">Tap to activate camera</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA Overlay Bar (always visible) */}
      {ctas.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 backdrop-blur-sm p-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {ctas.map((cta, index) => (
              <button
                key={index}
                onClick={() => handleCTAClick(cta)}
                className="px-4 py-2 rounded-full text-white font-medium transition-all duration-200 hover:scale-105"
                style={{ 
                  backgroundColor: accent,
                  boxShadow: `0 2px 10px ${accent}40`
                }}
              >
                {cta.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {!isARLoaded && !arError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <div className="text-gray-600">Loading AR...</div>
          </div>
        </div>
      )}
    </div>
  );
}