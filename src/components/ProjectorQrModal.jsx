import React, { useState } from 'react';
import { X, Copy, Check, Download, ExternalLink, Maximize2, Minimize2, Sparkles, Smartphone } from 'lucide-react';

export default function ProjectorQrModal({ isOpen, onClose, board }) {
  if (!isOpen || !board) return null;

  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Construct target board URL
  const baseUrl = window.location.origin + window.location.pathname;
  const boardUrl = `${baseUrl}?board=${board.id}`;
  // High quality QR code for projector (500x500)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&margin=15&data=${encodeURIComponent(boardUrl)}`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(boardUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `padlet-qr-${board.title || 'board'}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn transition-all ${
      isFullscreen ? 'p-0' : 'p-4'
    }`}>
      <div className={`w-full bg-white shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${
        isFullscreen 
          ? 'w-screen h-screen rounded-none max-w-none' 
          : 'max-w-xl rounded-3xl border border-gray-100'
      }`}>
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-gray-50/70">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-pink-500 text-white flex items-center justify-center font-bold shadow-sm">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                <span>{board.title}</span>
                <span className="text-xs font-normal text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-100">
                  수업용 대형 QR
                </span>
              </h2>
              <p className="text-xs text-gray-500">학생들이 스마트폰 카메라로 스캔하여 접속합니다.</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl text-gray-500 hover:bg-gray-200 transition-colors"
              title={isFullscreen ? "창 모드로 축소" : "프로젝터 전체화면 확대"}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors"
              title="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className={`flex-1 flex flex-col items-center justify-center p-6 text-center overflow-y-auto ${
          isFullscreen ? 'space-y-6 max-w-2xl mx-auto' : 'space-y-4'
        }`}>
          {/* Big QR Display Container */}
          <div className="p-4 bg-white rounded-3xl shadow-xl border-4 border-pink-100 transition-transform hover:scale-[1.02]">
            <img 
              src={qrCodeUrl} 
              alt={`${board.title} 접속 QR 코드`}
              className={`object-contain rounded-2xl mx-auto transition-all ${
                isFullscreen ? 'w-80 h-80 sm:w-96 sm:h-96' : 'w-56 h-56 sm:w-64 sm:h-64'
              }`}
            />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1 text-pink-600 bg-pink-50 px-3 py-1 rounded-full text-xs font-bold border border-pink-200">
              <Sparkles className="w-3.5 h-3.5" />
              <span>교실 칠판 / 빔프로젝터 띄우기용</span>
            </div>
            <h3 className={`font-black text-gray-900 tracking-tight ${isFullscreen ? 'text-2xl' : 'text-lg'}`}>
              스마트폰 기본 카메라 앱으로 QR 코드를 비춰주세요!
            </h3>
            <p className="text-xs sm:text-sm text-gray-500">
              별도의 앱 설치나 로그인 없이 바로 우리 반 패들렛에 접속됩니다.
            </p>
          </div>

          {/* URL Copy Bar */}
          <div className="w-full max-w-md bg-gray-50 p-2 rounded-2xl border border-gray-200 flex items-center space-x-2">
            <input 
              type="text" 
              readOnly 
              value={boardUrl} 
              className="flex-1 bg-transparent px-2.5 text-xs text-gray-700 font-mono select-all focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 active:bg-pink-700 text-white text-xs font-bold shadow-xs transition-all flex-shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '복사됨!' : '링크 복사'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <button
            onClick={handleDownloadQr}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold border border-gray-200 shadow-2xs transition-colors"
          >
            <Download className="w-4 h-4 text-pink-600" />
            <span>QR 이미지 파일 다운로드</span>
          </button>
          
          <div className="flex items-center space-x-2">
            <a
              href={boardUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1 px-3.5 py-2 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition-colors"
            >
              <span>새 탭에서 보드 열기</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
