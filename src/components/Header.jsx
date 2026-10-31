import React, { useState } from 'react';
import { 
  Palette, 
  Share2, 
  RotateCcw, 
  Plus, 
  Edit3, 
  Check, 
  Search, 
  Flame,
  Lock,
  Unlock,
  LogOut,
  ShieldCheck,
  Presentation,
  Columns3,
  LayoutGrid,
  Rows3,
  Table,
  ChevronDown,
  LayoutDashboard
} from 'lucide-react';

const LAYOUT_OPTIONS = [
  { id: 'shelf', name: '선반 (Columns)', desc: '섹션별 세로 컬럼 칸반', icon: Columns3 },
  { id: 'grid', name: '벽 (Wall / Grid)', desc: '핀터레스트형 다단 벽돌', icon: LayoutGrid },
  { id: 'stream', name: '스트림 (Stream)', desc: '1열 타임라인 피드', icon: Rows3 },
  { id: 'table', name: '테이블 (Table)', desc: '스프레드시트 표 보기', icon: Table }
];

export default function Header({ 
  board, 
  currentLayout = 'shelf',
  onChangeLayout,
  onUpdateTitle, 
  onOpenSettings, 
  onOpenShare, 
  onOpenSlideshow,
  onOpenFirebase,
  firebaseStatus,
  onResetData, 
  onAddSection,
  searchQuery,
  setSearchQuery,
  isAdmin,
  onOpenLogin,
  onLogout,
  onGoDashboard
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(board.title);
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);

  const handleTitleSubmit = (e) => {
    e?.preventDefault();
    if (titleInput.trim()) {
      onUpdateTitle(titleInput.trim());
    }
    setIsEditingTitle(false);
  };

  return (
    <header className="h-16 px-4 flex items-center justify-between bg-white/80 backdrop-blur-md border-b border-black/10 shadow-sm z-30 transition-all">
      {/* Left: Padlet Logo, Board Title & Author */}
      <div className="flex items-center space-x-3.5 min-w-0">
        {/* Padlet Origami Logo Icon */}
        <div 
          onClick={() => {
            if (isAdmin && onGoDashboard) onGoDashboard();
          }}
          className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 flex items-center justify-center shadow-md flex-shrink-0 cursor-pointer hover:scale-105 transition-transform" 
          title={isAdmin ? "교사용 대시보드로 이동" : "Padlet Clone"}
        >
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
        </div>

        {/* Title & Author Info */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center space-x-2">
            {isAdmin && isEditingTitle ? (
              <form onSubmit={handleTitleSubmit} className="flex items-center space-x-1">
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="px-2 py-0.5 text-lg font-bold bg-white border border-pink-400 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
                  autoFocus
                  onBlur={handleTitleSubmit}
                />
                <button 
                  type="submit" 
                  className="p-1 rounded hover:bg-gray-200 text-green-600"
                  title="저장"
                >
                  <Check className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div 
                className={`group flex items-center space-x-1.5 ${isAdmin ? 'cursor-pointer' : ''}`}
                onClick={() => {
                  if (isAdmin) {
                    setTitleInput(board.title);
                    setIsEditingTitle(true);
                  }
                }}
              >
                <h1 className="text-lg font-bold text-gray-900 truncate">
                  {board.title}
                </h1>
                {isAdmin && (
                  <Edit3 className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
            )}

            {/* Board Locked Badge */}
            {board.isLocked && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center space-x-1 flex-shrink-0" title="현재 글쓰기 잠금 상태입니다 (읽기 전용)">
                <Lock className="w-3 h-3 text-amber-600" />
                <span>글쓰기 잠김</span>
              </span>
            )}
            {/* Layout Switcher Dropdown (관리자 전용 / 게스트는 읽기 전용 뱃지) */}
            <div className="relative">
              <button
                onClick={() => {
                  if (!isAdmin) {
                    if (window.confirm('레이아웃 변경은 관리자만 가능합니다.\n관리자로 로그인하시겠습니까?')) {
                      onOpenLogin();
                    }
                    return;
                  }
                  setShowLayoutMenu(!showLayoutMenu);
                }}
                className={`flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded-full font-bold transition-all shadow-2xs border ${
                  isAdmin
                    ? 'bg-pink-100 hover:bg-pink-200 text-pink-700 border-pink-200 cursor-pointer'
                    : 'bg-gray-100/90 hover:bg-gray-200 text-gray-600 border-gray-200 cursor-pointer'
                }`}
                title={isAdmin ? "레이아웃 뷰 변경 (선반, 벽, 스트림, 테이블)" : "현재 레이아웃 (변경은 관리자 전용)"}
              >
                {currentLayout === 'shelf' && <Columns3 className="w-3.5 h-3.5" />}
                {currentLayout === 'grid' && <LayoutGrid className="w-3.5 h-3.5" />}
                {currentLayout === 'stream' && <Rows3 className="w-3.5 h-3.5" />}
                {currentLayout === 'table' && <Table className="w-3.5 h-3.5" />}
                <span>
                  {currentLayout === 'shelf' && '선반'}
                  {currentLayout === 'grid' && '벽 (Grid)'}
                  {currentLayout === 'stream' && '스트림'}
                  {currentLayout === 'table' && '테이블'}
                </span>
                {isAdmin ? (
                  <ChevronDown className="w-3 h-3 text-pink-600" />
                ) : (
                  <Lock className="w-3 h-3 text-gray-400" />
                )}
              </button>

              {isAdmin && showLayoutMenu && (
                <div
                  className="absolute left-0 top-8 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-40 animate-fadeIn"
                  onMouseLeave={() => setShowLayoutMenu(false)}
                >
                  <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    레이아웃 형식 (관리자 전용)
                  </div>
                  {LAYOUT_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        if (onChangeLayout) onChangeLayout(opt.id);
                        setShowLayoutMenu(false);
                      }}
                      className={`w-full px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                        currentLayout === opt.id
                          ? 'bg-pink-50 text-pink-600 font-bold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <opt.icon className="w-4 h-4 flex-shrink-0" />
                        <div className="text-left">
                          <p className="leading-tight">{opt.name}</p>
                          <p className="text-[10px] text-gray-400 font-normal">{opt.desc}</p>
                        </div>
                      </div>
                      {currentLayout === opt.id && <Check className="w-3.5 h-3.5 text-pink-600 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {isAdmin && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center space-x-1 flex-shrink-0">
                <ShieldCheck className="w-3 h-3" />
                <span>관리자</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1.5 text-xs text-gray-500">
            <img 
              src={board.builder.avatar} 
              alt={board.builder.name} 
              className="w-4 h-4 rounded-full object-cover border border-gray-200"
            />
            <span className="font-medium text-gray-700">{board.builder.name}</span>
            <span>•</span>
            <span>패들렛 보드</span>
          </div>
        </div>
      </div>

      {/* Middle: Search Box */}
      <div className="hidden md:flex items-center relative max-w-xs w-full mx-4">
        <Search className="w-4 h-4 absolute left-3 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="게시물 검색..."
          className="w-full pl-9 pr-3 py-1.5 text-sm bg-gray-100/80 hover:bg-gray-100 focus:bg-white border border-transparent focus:border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-300/50 transition-all placeholder-gray-400"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute right-3 text-xs text-gray-400 hover:text-gray-600 font-bold"
          >
            ✕
          </button>
        )}
      </div>

      {/* Right Action Buttons */}
      <div className="flex items-center space-x-2">
        {/* Firebase DB Connection Status Button (관리자 또는 일반 사용자도 상태 확인 가능) */}
        <button
          onClick={onOpenFirebase}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
            firebaseStatus?.isConnected 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100' 
              : 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100 animate-pulse'
          }`}
          title="Firebase DB 연결 설정"
        >
          <Flame className={`w-4 h-4 ${firebaseStatus?.isConnected ? 'fill-emerald-500 text-emerald-500' : 'fill-amber-500 text-amber-500'}`} />
          <span className="hidden sm:inline">
            {firebaseStatus?.isConnected ? 'Firebase 연동됨' : 'DB 설정'}
          </span>
          <span className={`w-2 h-2 rounded-full ${firebaseStatus?.isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
        </button>

        {/* Slideshow Presentation Mode Button */}
        <button
          onClick={onOpenSlideshow}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-bold shadow-sm shadow-pink-500/20 hover:scale-105 active:scale-95 transition-all"
          title="슬라이드쇼 발표 모드 시작"
        >
          <Presentation className="w-4 h-4" />
          <span className="hidden sm:inline">슬라이드쇼</span>
        </button>

        {/* Share Button (모두 사용 가능) */}
        <button
          onClick={onOpenShare}
          className="p-2 rounded-lg text-gray-600 hover:bg-black/5 hover:text-gray-900 transition-colors"
          title="공유 및 링크 복사"
        >
          <Share2 className="w-5 h-5" />
        </button>

        {/* 관리자 전용 기능: Add Section */}
        {isAdmin && (
          <button
            onClick={onAddSection}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-pink-500 hover:bg-pink-600 active:bg-pink-700 text-white text-sm font-semibold shadow-sm transition-all transform active:scale-95"
            title="새 열(섹션) 추가"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">섹션 추가</span>
          </button>
        )}

        {/* 관리자 전용 기능: Change Background / Settings */}
        {isAdmin && (
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg text-gray-600 hover:bg-black/5 hover:text-gray-900 transition-colors"
            title="배경화면 및 보드 설정"
          >
            <Palette className="w-5 h-5" />
          </button>
        )}

        {/* 관리자 전용 기능: Reset to Original Data */}
        {isAdmin && (
          <button
            onClick={onResetData}
            className="p-2 rounded-lg text-gray-600 hover:bg-black/5 hover:text-red-600 transition-colors"
            title="패들렛 원본 데이터로 리셋"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        )}

        {/* 관리자 전용 기능: 교사용 대시보드로 돌아가기 */}
        {isAdmin && onGoDashboard && (
          <button
            onClick={onGoDashboard}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 active:bg-pink-700 text-white text-xs font-bold shadow-xs transition-all hover:scale-102"
            title="교사용 대시보드로 이동"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">대시보드</span>
          </button>
        )}

        {/* Admin Login / Logout Button */}
        {isAdmin ? (
          <button
            onClick={onLogout}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-colors"
            title="관리자 로그아웃"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">로그아웃</span>
          </button>
        ) : (
          <button
            onClick={onOpenLogin}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-700 text-xs font-bold transition-all shadow-xs"
            title="관리자 로그인"
          >
            <Lock className="w-3.5 h-3.5 text-pink-600" />
            <span>관리자 로그인</span>
          </button>
        )}
      </div>
    </header>
  );
}
