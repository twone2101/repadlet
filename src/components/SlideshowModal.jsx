import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Maximize2, 
  Minimize2, 
  Heart, 
  MessageCircle, 
  ExternalLink,
  Presentation,
  Sparkles,
  Calendar,
  Layers,
  FileText,
  Download
} from 'lucide-react';

export default function SlideshowModal({
  isOpen,
  onClose,
  board,
  sections,
  posts
}) {
  // Flatten slides: Cover slide (index 0) + Post slides (index 1 to N)
  const slides = useMemo(() => {
    const list = [
      {
        type: 'cover',
        id: 'cover',
        title: board.title,
        builder: board.builder?.name || '작성자',
        avatar: board.builder?.avatar,
        sectionCount: sections.length,
        postCount: posts.length,
        createdAt: board.createdAt
      }
    ];

    // Order posts by section sort_index, then by post order
    sections.forEach((sec) => {
      const secPosts = posts.filter(p => p.sectionId === sec.id);
      secPosts.forEach((post) => {
        list.push({
          type: 'post',
          id: post.id,
          sectionTitle: sec.title,
          sectionId: sec.id,
          ...post
        });
      });
    });

    return list;
  }, [board, sections, posts]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoPlayInterval, setAutoPlayInterval] = useState(5); // seconds

  const currentSlide = slides[currentIndex] || slides[0];

  // Next & Previous Slide handlers
  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < slides.length - 1 ? prev + 1 : 0));
  }, [slides.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : slides.length - 1));
  }, [slides.length]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard navigation (화살표 키로 슬라이드 이동, ESC로 닫기 - f키 전체화면 단축키는 제거)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // 입력창에 포커스가 있을 때는 단축키 동작 방지
      const target = e.target;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, onClose]);

  // Autoplay timer
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      handleNext();
    }, autoPlayInterval * 1000);

    return () => clearInterval(timer);
  }, [isPlaying, autoPlayInterval, handleNext]);

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return '';
    }
  };

  const progressPercent = ((currentIndex + 1) / slides.length) * 100;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white select-none overflow-hidden animate-fadeIn">
      {/* Top Header Controls */}
      <header className="h-16 px-6 flex items-center justify-between bg-slate-900/80 backdrop-blur-md border-b border-white/10 z-20">
        {/* Left: Board Title & Current Section */}
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center">
            <Presentation className="w-4 h-4" />
          </div>
          <div className="flex items-center space-x-2 truncate">
            <span className="font-semibold text-sm text-gray-200 truncate">{board.title}</span>
            {currentSlide.type === 'post' && (
              <>
                <span className="text-gray-500">•</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  {currentSlide.sectionTitle}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Center: Slide Index / Counter */}
        <div className="text-xs font-medium text-gray-400 tracking-wider">
          <span className="text-white font-bold text-sm">{currentIndex + 1}</span> / {slides.length}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-2">
          {/* Autoplay button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              isPlaying 
                ? 'bg-pink-500 text-white border-pink-400 shadow-lg shadow-pink-500/30' 
                : 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/10'
            }`}
            title={isPlaying ? '자동 재생 일시정지' : '자동 재생 시작'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isPlaying ? '일시정지' : '자동재생'}</span>
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            title={isFullscreen ? '전체화면 종료 (F)' : '전체화면 (F)'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-300 hover:text-white hover:bg-red-500/20 hover:text-red-300 transition-colors"
            title="슬라이드쇼 종료 (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-white/10">
        <div 
          className="h-full bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main Slide Stage */}
      <main className="flex-1 relative flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        {/* Navigation Arrow Left */}
        <button
          onClick={handlePrev}
          className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white backdrop-blur-md transition-all z-30 shadow-2xl"
          title="이전 슬라이드 (← 키)"
        >
          <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>

        {/* Navigation Arrow Right */}
        <button
          onClick={handleNext}
          className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 p-3 sm:p-4 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white backdrop-blur-md transition-all z-30 shadow-2xl"
          title="다음 슬라이드 (→ 또는 스페이스 키)"
        >
          <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>

        {/* Slide Content Container */}
        <div className="w-full max-w-4xl max-h-full flex flex-col justify-center transition-all duration-300">
          {currentSlide.type === 'cover' ? (
            /* --- Cover Slide --- */
            <div className="text-center py-12 px-6 sm:px-12 rounded-3xl bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl border border-white/10 shadow-2xl space-y-6">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                <span>패들렛 프레젠테이션 모드</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                {currentSlide.title}
              </h1>

              <div className="flex items-center justify-center space-x-3 text-sm text-gray-300">
                {currentSlide.avatar && (
                  <img
                    src={currentSlide.avatar}
                    alt={currentSlide.builder}
                    className="w-8 h-8 rounded-full border border-white/20"
                  />
                )}
                <span className="font-semibold text-white">{currentSlide.builder}</span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(currentSlide.createdAt)}</span>
                </span>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto pt-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <div className="flex items-center justify-center space-x-1.5 text-xs text-gray-400 mb-1">
                    <Layers className="w-3.5 h-3.5" />
                    <span>섹션</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{currentSlide.sectionCount}개</div>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <div className="flex items-center justify-center space-x-1.5 text-xs text-gray-400 mb-1">
                    <Presentation className="w-3.5 h-3.5" />
                    <span>게시물</span>
                  </div>
                  <div className="text-2xl font-bold text-pink-400">{currentSlide.postCount}개</div>
                </div>
              </div>

              {/* Start Button */}
              <div className="pt-4">
                <button
                  onClick={handleNext}
                  className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-sm shadow-xl shadow-pink-500/30 hover:scale-105 active:scale-95 transition-all"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>첫 번째 슬라이드로 시작</span>
                </button>
              </div>
            </div>
          ) : (
            /* --- Post Slide --- */
            <div 
              style={{ 
                backgroundColor: currentSlide.color && currentSlide.color !== '#ffffff' 
                  ? currentSlide.color 
                  : 'rgba(30, 41, 59, 0.95)' 
              }}
              className={`rounded-3xl p-6 sm:p-10 shadow-2xl border border-white/10 backdrop-blur-xl flex flex-col max-h-[80vh] overflow-y-auto transition-all ${
                currentSlide.color && currentSlide.color !== '#ffffff' ? 'text-gray-900' : 'text-white'
              }`}
            >
              {/* Post Header: Section & Author Info */}
              <div className="flex items-center justify-between pb-4 border-b border-black/10">
                <div className="flex items-center space-x-3">
                  <img
                    src={currentSlide.author?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                    alt={currentSlide.author?.name || '작성자'}
                    className="w-10 h-10 rounded-full object-cover border-2 border-white/30 shadow-md"
                  />
                  <div>
                    <h3 className="font-bold text-sm sm:text-base leading-snug">
                      {currentSlide.author?.name || '익명 사용자'}
                    </h3>
                    <div className="text-xs opacity-75">
                      {formatDate(currentSlide.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-pink-500 text-white shadow-xs">
                    {currentSlide.sectionTitle}
                  </span>
                </div>
              </div>

              {/* Post Main Content */}
              <div className="py-6 space-y-4">
                {currentSlide.title && (
                  <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight">
                    {currentSlide.title}
                  </h2>
                )}

                {/* Media Attachment */}
                {currentSlide.attachment && (
                  <div className="rounded-2xl overflow-hidden border border-black/10 bg-black/5">
                    {currentSlide.attachment.type === 'image' && (
                      <div className="flex flex-col items-center">
                        <img
                          src={currentSlide.attachment.url}
                          alt={currentSlide.attachment.caption || '첨부 이미지'}
                          className="max-h-[45vh] w-auto object-contain rounded-xl"
                        />
                        {currentSlide.attachment.caption && (
                          <div className="w-full py-2 px-4 text-xs opacity-80 text-center font-medium bg-black/10">
                            {currentSlide.attachment.caption}
                          </div>
                        )}
                      </div>
                    )}

                    {currentSlide.attachment.type === 'file' && (
                      <div className="p-4 bg-white/20 backdrop-blur-md flex items-center justify-between rounded-xl">
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="p-2.5 rounded-xl bg-pink-500/20 text-pink-400">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div className="truncate">
                            <p className="text-sm font-bold truncate">{currentSlide.attachment.name}</p>
                            <p className="text-xs opacity-70">{currentSlide.attachment.size}</p>
                          </div>
                        </div>
                        <a
                          href={currentSlide.attachment.url}
                          download={currentSlide.attachment.name}
                          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold transition-all shadow-md flex-shrink-0 ml-3"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>다운로드</span>
                        </a>
                      </div>
                    )}

                    {currentSlide.attachment.type === 'link' && (
                      <a
                        href={currentSlide.attachment.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-4 bg-white/20 hover:bg-white/30 transition-colors"
                      >
                        <span className="text-sm font-semibold truncate pr-4">
                          {currentSlide.attachment.caption || currentSlide.attachment.url}
                        </span>
                        <ExternalLink className="w-4 h-4 flex-shrink-0" />
                      </a>
                    )}
                  </div>
                )}

                {/* Body Text */}
                {currentSlide.body && (
                  <p className="text-base sm:text-lg whitespace-pre-wrap leading-relaxed opacity-90">
                    {currentSlide.body}
                  </p>
                )}
              </div>

              {/* Footer: Reactions & Comments summary */}
              <div className="pt-4 mt-auto border-t border-black/10 flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1.5 font-bold">
                    <Heart className="w-4 h-4 fill-pink-500 text-pink-500" />
                    <span>좋아요 {currentSlide.likes || 0}</span>
                  </div>

                  <div className="flex items-center space-x-1.5 opacity-80">
                    <MessageCircle className="w-4 h-4" />
                    <span>댓글 {currentSlide.comments?.length || 0}개</span>
                  </div>
                </div>

                {/* Keyboard guide tip */}
                <span className="hidden sm:inline text-xs opacity-60">
                  다음: [스페이스] 또는 [→] 키
                </span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Thumbnail Strip */}
      <footer className="h-16 px-6 bg-slate-900/90 backdrop-blur-md border-t border-white/10 flex items-center justify-center space-x-2 overflow-x-auto z-20">
        {slides.map((s, idx) => (
          <button
            key={s.id || idx}
            onClick={() => setCurrentIndex(idx)}
            className={`flex-shrink-0 h-9 px-3 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              idx === currentIndex
                ? 'bg-pink-500 text-white ring-2 ring-pink-400 font-bold scale-105'
                : 'bg-white/10 hover:bg-white/20 text-gray-300'
            }`}
            title={s.type === 'cover' ? '표지' : `${s.sectionTitle}: ${s.title || '게시물'}`}
          >
            <span>{idx === 0 ? '표지' : idx}</span>
            <span className="max-w-[70px] truncate hidden md:inline">
              {s.type === 'cover' ? s.title : s.title || s.sectionTitle}
            </span>
          </button>
        ))}
      </footer>
    </div>
  );
}
