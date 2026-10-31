import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink, 
  Trash2, 
  Edit, 
  Send, 
  Share2, 
  Check, 
  Smile, 
  Clock, 
  User,
  Heart,
  FileText,
  Download,
  Paperclip,
  Pin,
  CheckCircle2
} from 'lucide-react';

const REACTION_EMOJIS = ['❤️', '👍', '🔥', '💡', '👏', '🎉', '🚀'];

export default function PostDetailModal({
  isOpen,
  onClose,
  post,
  sectionTitle,
  allPosts = [],
  onSelectPost,
  onEditPost,
  onDeletePost,
  onToggleReaction,
  onAddComment,
  onDeleteComment,
  onTogglePin,
  onApprove,
  isAdmin
}) {
  if (!isOpen || !post) return null;

  const [newCommentText, setNewCommentText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [copied, setCopied] = useState(false);

  // Calculate previous and next post within all posts
  const currentIndex = allPosts.findIndex(p => p.id === post.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < allPosts.length - 1;

  const handlePrev = () => {
    if (hasPrev) onSelectPost(allPosts[currentIndex - 1]);
  };

  const handleNext = () => {
    if (hasNext) onSelectPost(allPosts[currentIndex + 1]);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft' && hasPrev) handlePrev();
      if (e.key === 'ArrowRight' && hasNext) handleNext();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasPrev, hasNext, currentIndex]);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    onAddComment(post.id, newCommentText.trim());
    setNewCommentText('');
  };

  const handleCopyLink = () => {
    const permalink = `${window.location.origin}${window.location.pathname}?post=${post.id}`;
    navigator.clipboard?.writeText(permalink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Reactions format: { '❤️': 3, '👍': 1 }
  const reactions = post.reactions || (post.likes ? { '❤️': post.likes } : {});
  const userReactions = post.userReactions || (post.userLiked ? ['❤️'] : []);

  // Format date helper
  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('ko-KR', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-fadeIn">
      {/* Navigation Arrow Left (Floating) */}
      {hasPrev && (
        <button
          onClick={handlePrev}
          className="hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/40 active:scale-95 text-white backdrop-blur-md transition-all z-50 shadow-xl"
          title="이전 게시물 (←)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Navigation Arrow Right (Floating) */}
      {hasNext && (
        <button
          onClick={handleNext}
          className="hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/40 active:scale-95 text-white backdrop-blur-md transition-all z-50 shadow-xl"
          title="다음 게시물 (→)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Main Modal Card */}
      <div 
        style={{ backgroundColor: post.color || '#ffffff' }}
        className="w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl border border-black/10 overflow-hidden flex flex-col transition-all"
      >
        {/* Top Header Bar */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-black/10 bg-white/40 backdrop-blur-md flex-shrink-0">
          {/* Section Breadcrumb & Author Info */}
          <div className="flex items-center space-x-3 min-w-0">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-pink-500 text-white shadow-xs">
              {sectionTitle || '섹션'}
            </span>
            {/* Pinned & Approved status badges */}
            {post.pinned && (
              <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-bold bg-pink-100 text-pink-700 border border-pink-300">
                <Pin className="w-3 h-3 fill-pink-500" />
                <span>고정됨</span>
              </span>
            )}
            {post.approved === false && (
              <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                <Clock className="w-3 h-3 text-amber-600" />
                <span>승인 대기</span>
              </span>
            )}
            <div className="flex items-center space-x-2 text-xs text-gray-600 truncate">
              <span className="font-semibold text-gray-900">{post.author?.name || '익명 사용자'}</span>
              <span>•</span>
              <span className="text-gray-500">{formatDate(post.createdAt)}</span>
            </div>
          </div>

          {/* Top Actions: Copy Link, Edit, Delete, Close */}
          <div className="flex items-center space-x-1.5 flex-shrink-0">
            <button
              onClick={handleCopyLink}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-black/5 hover:text-gray-900 transition-colors"
              title="게시물 링크 복사"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? '복사됨' : '공유'}</span>
            </button>

            {isAdmin && (
              <>
                {/* Approve Button */}
                {post.approved === false && onApprove && (
                  <button
                    onClick={() => onApprove(post.id)}
                    className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-colors shadow-2xs"
                    title="게시물 승인하기"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>승인하기</span>
                  </button>
                )}
                {/* Pin Toggle Button */}
                {onTogglePin && (
                  <button
                    onClick={() => onTogglePin(post.id)}
                    className={`p-1.5 rounded-xl transition-colors ${post.pinned ? 'bg-pink-100 text-pink-600' : 'text-gray-500 hover:bg-black/5 hover:text-gray-900'}`}
                    title={post.pinned ? '상단 고정 해제' : '상단 고정'}
                  >
                    <Pin className={`w-4 h-4 ${post.pinned ? 'fill-pink-500' : ''}`} />
                  </button>
                )}
                <button
                  onClick={() => {
                    onClose();
                    onEditPost(post);
                  }}
                  className="p-1.5 rounded-xl text-blue-600 hover:bg-blue-50 transition-colors"
                  title="게시물 수정"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('이 게시물을 정말 삭제하시겠습니까?')) {
                      onClose();
                      onDeletePost(post.id);
                    }
                  }}
                  className="p-1.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                  title="게시물 삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-black/10 transition-colors ml-1"
              title="닫기 (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Two-column layout on desktop (Post content on left, Comments on right) */}
        <div className="flex-1 overflow-y-auto flex flex-col md:flex-row">
          {/* Left Column: Post Content & Reactions */}
          <div className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto border-b md:border-b-0 md:border-r border-black/10">
            {/* Title */}
            {post.title && (
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight tracking-tight">
                {post.title}
              </h1>
            )}

            {/* Attachment Viewer */}
            {post.attachment && (
              <div className="rounded-2xl overflow-hidden border border-black/10 bg-black/5 shadow-inner">
                {post.attachment.type === 'image' && (
                  <div>
                    <img
                      src={post.attachment.url}
                      alt={post.attachment.caption || post.title}
                      className="w-full max-h-[50vh] object-contain bg-black/20"
                    />
                    <div className="p-3 bg-white/70 backdrop-blur-xs flex items-center justify-between text-xs text-gray-600">
                      <span className="font-medium italic">{post.attachment.caption || '첨부 이미지'}</span>
                      <a
                        href={post.attachment.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-pink-600 hover:underline flex items-center space-x-1 font-semibold"
                      >
                        <span>원본 보기</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}

                {post.attachment.type === 'file' && (
                  <div className="p-4 bg-white/90 flex items-center justify-between">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="p-3 rounded-2xl bg-pink-100 text-pink-600 flex-shrink-0">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-bold text-gray-900 truncate">{post.attachment.name}</p>
                        <p className="text-xs text-gray-500">{post.attachment.size}</p>
                      </div>
                    </div>
                    <a
                      href={post.attachment.url}
                      download={post.attachment.name}
                      className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold shadow-xs transition-colors flex-shrink-0 ml-3"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>다운로드</span>
                    </a>
                  </div>
                )}

                {post.attachment.type === 'link' && (
                  <a
                    href={post.attachment.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-4 bg-white/80 hover:bg-white flex items-center justify-between transition-colors group"
                  >
                    <div className="truncate pr-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">외부 링크</p>
                      <p className="text-sm font-bold text-blue-600 group-hover:underline truncate">
                        {post.attachment.caption || post.attachment.url}
                      </p>
                    </div>
                    <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-blue-600 flex-shrink-0" />
                  </a>
                )}
              </div>
            )}

            {/* Body text */}
            {post.body && (
              <div className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap break-words">
                {post.body}
              </div>
            )}

            {/* Multi-Emoji Reactions Bar */}
            <div className="pt-4 border-t border-black/10">
              <div className="flex flex-wrap items-center gap-2">
                {/* Active Reactions Chips */}
                {Object.entries(reactions).map(([emoji, count]) => {
                  const isUserActive = userReactions.includes(emoji);
                  return (
                    <button
                      key={emoji}
                      onClick={() => onToggleReaction(post.id, emoji)}
                      className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all transform active:scale-90 ${
                        isUserActive
                          ? 'bg-pink-100 text-pink-700 border-2 border-pink-400 shadow-xs'
                          : 'bg-black/5 hover:bg-black/10 text-gray-700 border border-black/5'
                      }`}
                      title={`${emoji} 반응 토글`}
                    >
                      <span className="text-sm">{emoji}</span>
                      <span>{count}</span>
                    </button>
                  );
                })}

                {/* Add Reaction Button & Picker */}
                <div className="relative">
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-semibold text-gray-600 bg-black/5 hover:bg-black/10 transition-colors"
                    title="이모지 반응 추가"
                  >
                    <Smile className="w-3.5 h-3.5 text-pink-500" />
                    <span>반응 추가</span>
                  </button>

                  {/* Emoji Picker Popover */}
                  {showEmojiPicker && (
                    <div 
                      className="absolute left-0 bottom-full mb-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 flex items-center space-x-1 z-30 animate-fadeIn"
                      onMouseLeave={() => setShowEmojiPicker(false)}
                    >
                      {REACTION_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => {
                            onToggleReaction(post.id, emoji);
                            setShowEmojiPicker(false);
                          }}
                          className={`p-2 rounded-xl text-base hover:scale-125 transition-transform ${
                            userReactions.includes(emoji) ? 'bg-pink-100' : 'hover:bg-gray-100'
                          }`}
                          title={emoji}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Full Comments Thread */}
          <div className="w-full md:w-80 lg:w-96 p-6 flex flex-col bg-black/[0.02]">
            <h3 className="font-bold text-sm text-gray-800 mb-4 flex items-center justify-between">
              <span>댓글 ({post.comments?.length || 0})</span>
            </h3>

            {/* Comments List */}
            <div className="flex-1 space-y-3 overflow-y-auto pr-1 max-h-[50vh] md:max-h-[60vh]">
              {post.comments && post.comments.length > 0 ? (
                post.comments.map((comment) => (
                  <div 
                    key={comment.id}
                    className="p-3 rounded-2xl bg-white shadow-xs border border-black/5 group/comm relative"
                  >
                    <div className="flex items-center justify-between mb-1 text-xs">
                      <span className="font-bold text-gray-900">{comment.author || '방문자'}</span>
                      {isAdmin && (
                        <button
                          onClick={() => onDeleteComment(post.id, comment.id)}
                          className="opacity-0 group-hover/comm:opacity-100 text-gray-400 hover:text-red-500 p-0.5 rounded transition-opacity"
                          title="댓글 삭제"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {comment.text}
                    </p>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-gray-400 text-xs">
                  아직 등록된 댓글이 없습니다.<br />가장 먼저 의견을 남겨보세요!
                </div>
              )}
            </div>

            {/* New Comment Form */}
            <form onSubmit={handleCommentSubmit} className="mt-4 pt-3 border-t border-black/10 flex items-center space-x-2">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="댓글 입력..."
                className="flex-1 text-xs px-3.5 py-2.5 rounded-xl bg-white border border-black/10 focus:outline-none focus:ring-2 focus:ring-pink-400 shadow-xs"
              />
              <button
                type="submit"
                disabled={!newCommentText.trim()}
                className="p-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 disabled:opacity-40 text-white shadow-xs transition-colors"
                title="댓글 전송"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
