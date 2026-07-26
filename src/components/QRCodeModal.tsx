import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, QrCode, Copy, Check, Smartphone } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://ais-dev-applet.com';

  useEffect(() => {
    if (isOpen && currentUrl) {
      QRCode.toDataURL(currentUrl, { width: 300, margin: 2, color: { dark: '#1e293b', light: '#ffffff' } })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('QR code generation error:', err));
    }
  }, [isOpen, currentUrl]);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-2 sm:p-4 touch-pan-y overflow-y-auto">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-4 sm:p-6 md:p-8 max-w-md w-full max-h-[88vh] sm:max-h-[92vh] overflow-y-auto overscroll-contain touch-pan-y shadow-2xl relative text-white text-center my-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex justify-center mb-3">
          <div className="bg-amber-500/20 text-amber-400 p-3 rounded-2xl border border-amber-500/30">
            <QrCode className="w-8 h-8" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-amber-400 mb-1">학생 모바일 QR 입장</h2>
        <p className="text-xs text-slate-300 mb-6">
          스마트폰이나 태블릿 카메라로 QR 코드를 스캔하여 게임에 접속하세요!
        </p>

        {/* QR Canvas / Image */}
        <div className="bg-white p-4 rounded-2xl inline-block shadow-lg mb-6 border-4 border-amber-400/50">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="Game QR Code" className="w-56 h-56 mx-auto" />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center text-slate-500 text-xs">
              QR 코드 생성 중...
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs mb-6">
          <Smartphone className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="truncate text-slate-300 flex-1 text-left">{currentUrl}</span>
          <button
            onClick={handleCopy}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition shrink-0 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? '복사됨' : '복사'}</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 rounded-xl transition text-sm cursor-pointer"
        >
          창 닫기
        </button>
      </div>
    </div>
  );
};
