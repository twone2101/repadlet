import React from 'react';
import { School, Sparkles, Lock, RefreshCw, Flame, ExternalLink } from 'lucide-react';

export default function EmptyBoardState({ 
  onOpenLogin, 
  onOpenFirebase, 
  firebaseStatus,
  boardNotFound = false
}) {
  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-pink-50 via-slate-50 to-indigo-50 flex flex-col justify-between p-4 sm:p-6 font-sans antialiased selection:bg-pink-300">
      {/* Top Bar */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 flex items-center justify-center shadow-md">
            <School className="w-5 h-5 text-white" />
          </div>
          <span className="text-base font-bold text-gray-800 tracking-tight">
            학교 패들렛
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Firebase Status */}
          <button
            onClick={onOpenFirebase}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              firebaseStatus?.isConnected 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100' 
                : 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
            }`}
            title="Firebase DB 연결 설정"
          >
            <Flame className={`w-3.5 h-3.5 ${firebaseStatus?.isConnected ? 'fill-emerald-500 text-emerald-500' : 'fill-amber-500 text-amber-500'}`} />
            <span className="hidden sm:inline">
              {firebaseStatus?.isConnected ? 'DB 연동됨' : 'DB 설정'}
            </span>
          </button>

          {/* Teacher Login Button */}
          <button
            onClick={onOpenLogin}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-700 text-xs font-bold transition-all shadow-xs"
          >
            <Lock className="w-3.5 h-3.5 text-pink-600" />
            <span>선생님 로그인</span>
          </button>
        </div>
      </header>

      {/* Center Notice Card */}
      <main className="max-w-md w-full mx-auto my-auto py-12 px-6 sm:px-8 bg-white/80 backdrop-blur-md rounded-3xl border border-white shadow-xl shadow-pink-500/5 text-center space-y-6 animate-fadeIn">
        {/* Animated Badge Icon */}
        <div className="relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 rounded-3xl bg-pink-500/10 animate-ping" />
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-white shadow-lg shadow-pink-500/30">
            <School className="w-10 h-10" />
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-pink-50 border border-pink-200/80 text-pink-700 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{boardNotFound ? '존재하지 않는 보드' : '수업 준비 중'}</span>
          </div>
          
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            {boardNotFound 
              ? '보드를 찾을 수 없습니다' 
              : '개설된 수업 패들렛이 없습니다'}
          </h2>

          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-sm mx-auto">
            {boardNotFound
              ? '요청하신 패들렛 보드가 삭제되었거나 링크 주소가 올바르지 않습니다. 선생님께 올바른 QR 코드나 링크를 요청해 주세요.'
              : '선생님이 새로운 수업 보드를 개설하고 링크나 QR 코드를 공유해 줄 때까지 잠시만 기다려주세요!'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <button
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 text-xs font-bold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>새로고침</span>
          </button>

          <button
            onClick={onOpenLogin}
            className="w-full sm:w-auto flex items-center justify-center space-x-1.5 px-5 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 active:bg-pink-700 text-white text-xs font-bold shadow-md shadow-pink-500/20 transition-all hover:scale-102"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>선생님(관리자) 로그인</span>
          </button>
        </div>

        {/* Helpful Tip */}
        <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 text-[11px] text-gray-500">
          💡 선생님이 수업을 시작하시면 스마트폰 카메라로 QR 코드를 찍고 바로 입장할 수 있습니다.
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-400 py-2">
        <span>© 학교 수업용 실시간 패들렛</span>
      </footer>
    </div>
  );
}
