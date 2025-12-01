import React, { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { useRouter } from "next/router";

const QRCodeGenerator = ({ primary_color,logoUrl, className }) => {
  const { asPath } = useRouter();
  const url = process.env.APP_URL + asPath;
  const canvasRef = useRef(null);

  useEffect(() => {
    const drawQRCode = async () => {
      if (url) {
        try {
          const qrCodeDataUrl = await QRCode.toDataURL(url, {
            errorCorrectionLevel: "H",
            scale: 11, 
          });

          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d");

          const qrCodeImg = new Image();
          qrCodeImg.src = qrCodeDataUrl;

          qrCodeImg.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.drawImage(qrCodeImg, 0, 0, canvas.width, canvas.height);

            const cornerSize = 25;
            ctx.fillStyle = primary_color;

            ctx.fillRect(0, 0, cornerSize, cornerSize);
            ctx.clearRect(6, 6, cornerSize - 12, cornerSize - 12);

            ctx.fillRect(canvas.width - cornerSize, 0, cornerSize, cornerSize);
            ctx.clearRect(canvas.width - cornerSize + 6, 6, cornerSize - 12, cornerSize - 12);

            ctx.fillRect(0, canvas.height - cornerSize, cornerSize, cornerSize);
            ctx.clearRect(6, canvas.height - cornerSize + 6, cornerSize - 12, cornerSize - 12);

            ctx.fillRect(canvas.width - cornerSize, canvas.height - cornerSize, cornerSize, cornerSize);
            ctx.clearRect(canvas.width - cornerSize + 6, canvas.height - cornerSize + 6, cornerSize - 12, cornerSize - 12);

            const logoImg = new Image();
            logoImg.src = logoUrl;

            logoImg.onload = () => {
              const logoSize = 100; 
              const x = (canvas.width - logoSize) / 2;
              const y = (canvas.height - logoSize) / 2;

              ctx.save();
              ctx.beginPath();
              ctx.arc(x + logoSize / 2, y + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
              ctx.clip();

              ctx.drawImage(logoImg, x, y, logoSize, logoSize);

              ctx.restore();

              ctx.beginPath();
              ctx.arc(x + logoSize / 2, y + logoSize / 2, logoSize / 2 + 2, 0, Math.PI * 2);
              ctx.strokeStyle = "#00ff00"; 
              ctx.lineWidth = 2;
              ctx.stroke();
              ctx.closePath();
            };
          };
        } catch (error) {
          // console.error( error);
        }
      }
    };

    drawQRCode();
  }, [url, logoUrl]);

  return <canvas width={300} height={300} ref={canvasRef} className={className} />;
};

export default QRCodeGenerator;
