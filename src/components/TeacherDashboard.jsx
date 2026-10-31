import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  ExternalLink, 
  Lock, 
  Unlock, 
  Trash2, 
  QrCode, 
  Copy, 
  Check, 
  Layers, 
  MessageSquare, 
  LogOut, 
  Sparkles,
  School,
  Flame,
  Calendar,
  Eye
} from 'lucide-react';
import ProjectorQrModal from './ProjectorQrModal';
import CreateBoardModal from './CreateBoardModal';

export default function TeacherDashboard({
  boards = [],
  sections = [],
  posts = [],
  onSelectBoard,
  onCreateBoard,
  onUpdateBoard,
  onDeleteBoard,
  onLogout,
  onOpenFirebase,
  firebaseStatus
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedQrBoard, setSelectedQrBoard] = useState(null);
  const [copiedBoardId, setCopiedBoardId] = useState(null);

  // Filter boards
  const filteredBoards = boards.filter(b => 
    b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.description && b.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Statistics
  const totalBoards = boards.length;
  const totalPosts = posts.length;
  const lockedBoards = boards.filter(b => b.isLocked).length;

  const handleCopyLink = (board) => {
    const baseUrl = window.location.origin + window.location.pathname;
    const url = `${baseUrl}?board=${board.id}`;
    navigator.clipboard?.writeText(url);
    setCopiedBoardId(board.id);
    setTimeout(() => setCopiedBoardId(null), 2000);
  };

  const handleToggleLock = (board, e) => {
    e.stopPropagation();
    const nextLocked = !board.isLocked;
    onUpdateBoard(board.id, { isLocked: nextLocked });
  };

  const handleDelete = (board, e) => {
    e.stopPropagation();
    if (window.confirm(`정말 '${board.title}' 보드를 삭제하시겠습니까?\n이 반의 모든 섹션과 학생 게시물이 함께 삭제됩니다.`)) {
      onDeleteBoard(board.id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-pink-50/20 to-indigo-50/20 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200/80 px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-400 flex items-center justify-center shadow-md">
              <School className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-black text-gray-900 tracking-tight">
                  교사용 패들렛 대시보드
                </h1>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
                  선생님 전용
                </span>
              </div>
              <p className="text-xs text-gray-500 hidden sm:block">
                수업별 패들렛 보드를 생성하고 학생들의 글쓰기를 실시간으로 관리하세요.
              </p>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center space-x-2">
            {/* Firebase Status */}
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
              <span className="hidden md:inline">
                {firebaseStatus?.isConnected ? 'Firebase 연결됨' : 'DB 설정'}
              </span>
            </button>

            {/* Create Board Primary Button */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 active:bg-pink-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-pink-500/20 hover:scale-102 active:scale-98 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>새 보드 만들기</span>
            </button>

            {/* Logout */}
            <button
              onClick={onLogout}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold flex items-center space-x-1 transition-colors"
              title="관리자 로그아웃"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">로그아웃</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* Top Summary Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-xs flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center font-bold">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500">개설된 반 보드</p>
              <h3 className="text-2xl font-black text-gray-900">{totalBoards} <span className="text-xs font-normal text-gray-400">개</span></h3>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-xs flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500">전체 학생 게시글</p>
              <h3 className="text-2xl font-black text-gray-900">{totalPosts} <span className="text-xs font-normal text-gray-400">개</span></h3>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-gray-100 shadow-xs flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500">글쓰기 잠금(수업완료) 반</p>
              <h3 className="text-2xl font-black text-gray-900">{lockedBoards} <span className="text-xs font-normal text-gray-400">개</span></h3>
            </div>
          </div>
        </div>

        {/* Search & Header Section */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <div>
            <h2 className="text-lg font-bold text-gray-900">우리 학교 반별 패들렛 목록</h2>
            <p className="text-xs text-gray-500">학생들에게 공유할 링크와 QR 코드를 확인하거나 수업 보드로 입장하세요.</p>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="반 또는 수업 이름 검색..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* Boards Grid */}
        {filteredBoards.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200 p-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-800">등록된 패들렛 보드가 없습니다</h3>
              <p className="text-xs text-gray-500 mt-1">수업에 사용할 첫 번째 반 패들렛 보드를 만들어보세요!</p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold shadow-md shadow-pink-500/20 inline-flex items-center space-x-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>새 패들렛 보드 만들기</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBoards.map((board) => {
              // Calculate posts and sections for this board
              const boardSections = sections.filter(s => String(s.boardId || '271201035') === String(board.id));
              const boardPosts = posts.filter(p => String(p.boardId || '271201035') === String(board.id));
              const isLocked = !!board.isLocked;

              return (
                <div 
                  key={board.id}
                  className="group bg-white rounded-3xl border border-gray-200/90 hover:border-pink-300 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden"
                >
                  {/* Card Header Cover Background */}
                  <div 
                    className="h-28 relative p-4 flex flex-col justify-between cursor-pointer"
                    style={{
                      backgroundImage: board.background?.url ? `url(${board.background.url})` : 'none',
                      backgroundColor: '#374151',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                    onClick={() => onSelectBoard(board.id)}
                  >
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[0.5px] group-hover:bg-black/30 transition-colors" />
                    
                    {/* Top Row Badges */}
                    <div className="relative z-10 flex items-center justify-between">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md shadow-xs flex items-center space-x-1 ${
                        isLocked 
                          ? 'bg-amber-500/90 text-white' 
                          : 'bg-emerald-500/90 text-white'
                      }`}>
                        {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        <span>{isLocked ? '글쓰기 잠김' : '학생 작성 가능'}</span>
                      </span>

                      <button
                        onClick={(e) => handleDelete(board, e)}
                        className="p-1.5 rounded-lg bg-black/30 hover:bg-red-600 text-white transition-colors"
                        title="보드 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Bottom Title inside Cover */}
                    <div className="relative z-10">
                      <h3 className="text-lg font-black text-white drop-shadow truncate group-hover:text-pink-200 transition-colors">
                        {board.title}
                      </h3>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <p className="text-xs text-gray-600 line-clamp-2 min-h-[32px]">
                        {board.description || '작성된 설명이 없습니다.'}
                      </p>

                      <div className="flex items-center space-x-3 mt-3 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Layers className="w-3.5 h-3.5 text-gray-400" />
                          <span>{boardSections.length}개 섹션</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <MessageSquare className="w-3.5 h-3.5 text-pink-500" />
                          <span className="font-semibold text-gray-700">{boardPosts.length}개 게시물</span>
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
                      {/* Projector QR & Copy Link */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setSelectedQrBoard(board)}
                          className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-bold transition-colors"
                          title="수업 빔프로젝터용 대형 QR 코드 띄우기"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>대형 QR 코드</span>
                        </button>

                        <button
                          onClick={() => handleCopyLink(board)}
                          className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold border border-gray-200 transition-colors"
                          title="학생 접속용 주소 복사"
                        >
                          {copiedBoardId === board.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-green-600" />
                              <span className="text-green-600 font-bold">복사됨!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>링크 복사</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Lock Toggle & Enter Board */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleToggleLock(board, e)}
                          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 border transition-all ${
                            isLocked 
                              ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200' 
                              : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200'
                          }`}
                          title={isLocked ? "현재 잠금 상태 (클릭 시 작성 허용)" : "현재 작성 가능 (클릭 시 읽기 전용으로 잠금)"}
                        >
                          {isLocked ? <Lock className="w-3.5 h-3.5 text-amber-600" /> : <Unlock className="w-3.5 h-3.5" />}
                          <span>{isLocked ? '글쓰기 잠금 해제' : '수업종료 글잠금'}</span>
                        </button>

                        <button
                          onClick={() => onSelectBoard(board.id)}
                          className="flex-1 py-2 px-3 rounded-xl bg-gray-900 hover:bg-black active:bg-gray-800 text-white text-xs font-bold flex items-center justify-center space-x-1 transition-all shadow-2xs"
                        >
                          <span>보드 입장</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modals */}
      <CreateBoardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateBoard={onCreateBoard}
      />

      {selectedQrBoard && (
        <ProjectorQrModal
          isOpen={!!selectedQrBoard}
          onClose={() => setSelectedQrBoard(null)}
          board={selectedQrBoard}
        />
      )}
    </div>
  );
}
