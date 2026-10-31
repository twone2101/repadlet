import React, { useState } from 'react';
import { X, Copy, Check, QrCode, Globe, ShieldCheck, Download, ExternalLink } from 'lucide-react';

export default function ShareModal({ isOpen, onClose, board }) {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);
  const baseUrl = window.location.origin + window.location.pathname;
  const currentUrl = board?.id ? `${baseUrl}?board=${board.id}` : window.location.href;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(currentUrl)}`;

  const handleCopy = (text) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    // Open QR image in new window or trigger download
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `padlet-qrcode-${board?.title || 'board'}-${Date.now()}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isLocked = !!board?.isLocked;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-gray-100 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-pink-500" />
            <h2 className="text-base font-bold text-gray-900">{board?.title ? `${board.title} 공유` : '패들렛 공유'}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Privacy status */}
          <div className={`flex items-center space-x-3 p-3 rounded-2xl border ${
            isLocked 
              ? 'bg-amber-50 border-amber-200' 
              : 'bg-pink-50 border-pink-100'
          }`}>
            <ShieldCheck className={`w-5 h-5 flex-shrink-0 ${isLocked ? 'text-amber-600' : 'text-pink-600'}`} />
            <div>
              <p className={`text-xs font-bold ${isLocked ? 'text-amber-900' : 'text-pink-900'}`}>
                {isLocked ? '글쓰기 잠금 상태 (읽기 전용)' : '학생/방문자 작성 가능'}
              </p>
              <p className={`text-[11px] ${isLocked ? 'text-amber-700' : 'text-pink-700'}`}>
                {isLocked 
                  ? '선생님이 글 작성을 잠가두어 열람만 가능합니다.' 
                  : '링크나 QR 코드가 있는 학생 누구나 카드를 읽고 작성할 수 있습니다.'}
              </p>
            </div>
          </div>

          {/* Copy Link Box */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">패들렛 웹 주소 (URL)</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="flex-1 text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 select-all focus:outline-none"
              />
              <button
                onClick={() => handleCopy(currentUrl)}
                className="flex items-center space-x-1 px-3.5 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold shadow-xs transition-colors flex-shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '복사됨' : '복사'}</span>
              </button>
            </div>
          </div>

          {/* Actual Scannable QR Code */}
          <div className="pt-2 flex flex-col items-center justify-center p-4 bg-gray-50/80 border border-gray-200 rounded-2xl text-center">
            <div className="p-2 bg-white rounded-2xl shadow-sm border border-gray-200 mb-2.5">
              <img 
                src={qrCodeUrl} 
                alt="실시간 패들렛 접속 QR 코드" 
                className="w-36 h-36 object-contain rounded-lg"
                loading="eager"
              />
            </div>
            <p className="text-xs font-bold text-gray-800">모바일 카메라로 스캔하여 즉시 접속</p>
            <p className="text-[11px] text-gray-500 mt-0.5">스마트폰 카메라로 비추면 현재 패들렛 페이지로 바로 이동합니다.</p>

            <button
              onClick={handleDownloadQr}
              className="mt-3 flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold border border-gray-200 shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-pink-600" />
              <span>QR 코드 이미지 다운로드</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-gray-100 bg-gray-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
