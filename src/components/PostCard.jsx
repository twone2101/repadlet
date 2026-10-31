import React, { useState } from 'react';
import { 
  Heart, 
  MessageCircle, 
  MoreVertical, 
  Trash2, 
  Edit, 
  ExternalLink,
  Send,
  Maximize2,
  Smile,
  FileText,
  Download,
  Pin,
  CheckCircle2,
  Clock
} from 'lucide-react';

const QUICK_EMOJIS = ['❤️', '👍', '🔥', '💡', '👏', '🎉'];

export default function PostCard({ 
  post, 
  onEdit, 
  onDelete, 
  onToggleLike, 
  onToggleReaction,
  onOpenDetail,
  onAddComment,
  onDeleteComment,
  onDragStart,
  onTogglePin,
  onApprove,
  isAdmin
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    onAddComment(post.id, newCommentText.trim());
    setNewCommentText('');
  };

  const handleReactionClick = (emoji) => {
    if (onToggleReaction) {
      onToggleReaction(post.id, emoji);
    } else if (onToggleLike) {
      onToggleLike(post.id);
    }
  };

  // Format date helper
  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  // Reactions format: { '❤️': 3, '👍': 1 }
  const reactions = post.reactions || (post.likes ? { '❤️': post.likes } : {});
  const userReactions = post.userReactions || (post.userLiked ? ['❤️'] : []);

  return (
    <div
      draggable={isAdmin}
      onDragStart={isAdmin ? (e) => onDragStart(e, post.id) : undefined}
      style={{ backgroundColor: post.color || '#ffffff' }}
      className={`group relative rounded-2xl shadow-sm hover:shadow-md border border-black/5 p-4 transition-all duration-200 mb-3 ${
        isAdmin ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
      }`}
    >
      {/* Top Header: Author & Options & Zoom Button */}
      <div className="flex items-center justify-between mb-2.5">
        <div 
          onClick={() => onOpenDetail && onOpenDetail(post)}
          className="flex items-center space-x-2 cursor-pointer flex-1 min-w-0"
          title="게시물 상세 보기"
        >
          <img 
            src={post.author?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"} 
            alt={post.author?.name || "작성자"} 
            className="w-7 h-7 rounded-full object-cover border border-black/10 shadow-xs flex-shrink-0"
          />
          <div className="flex flex-col truncate">
            <span className="text-xs font-semibold text-gray-800 leading-tight truncate hover:text-pink-600 transition-colors">
              {post.author?.name || "익명 사용자"}
            </span>
            <span className="text-[10px] text-gray-500 leading-tight">
              {formatDate(post.createdAt)}
            </span>
          </div>
        </div>

        {/* Right Header Buttons: Detail Zoom & Admin Menu */}
        <div className="flex items-center space-x-1 flex-shrink-0">
          {/* Pinned Icon Badge */}
          {post.pinned && (
            <div 
              className="p-1 rounded-full text-pink-600 bg-pink-50"
              title="상단 고정된 게시물"
            >
              <Pin className="w-3.5 h-3.5 fill-pink-500" />
            </div>
          )}

          {/* Zoom / Expand Button */}
          {onOpenDetail && (
            <button
              onClick={() => onOpenDetail(post)}
              className="p-1 rounded-full text-gray-400 hover:text-pink-600 hover:bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"
              title="상세 보기 (확대)"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* More Actions Menu (관리자 전용) */}
          {isAdmin && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"
                title="옵션"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <div 
                  className="absolute right-0 top-6 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20"
                  onMouseLeave={() => setShowMenu(false)}
                >
                  {/* Pin Toggle */}
                  {onTogglePin && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onTogglePin(post.id);
                      }}
                      className="w-full px-3 py-1.5 text-xs text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Pin className={`w-3.5 h-3.5 ${post.pinned ? 'text-pink-500 fill-pink-500' : 'text-gray-500'}`} />
                      <span>{post.pinned ? '고정 해제' : '상단 고정'}</span>
                    </button>
                  )}
                  {/* Approve button if pending */}
                  {post.approved === false && onApprove && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onApprove(post.id);
                      }}
                      className="w-full px-3 py-1.5 text-xs text-left text-emerald-600 hover:bg-emerald-50 flex items-center space-x-2 font-semibold"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>게시물 승인</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onEdit(post);
                    }}
                    className="w-full px-3 py-1.5 text-xs text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Edit className="w-3.5 h-3.5 text-blue-500" />
                    <span>수정하기</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDelete(post.id);
                    }}
                    className="w-full px-3 py-1.5 text-xs text-left text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>삭제하기</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pending Approval Banner (승인 대기 중 표시) */}
      {post.approved === false && (
        <div className="mb-2.5 px-2.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-[11px] font-bold text-amber-800">
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
            <span>승인 대기 중</span>
          </div>
          {isAdmin && onApprove && (
            <button
              onClick={() => onApprove(post.id)}
              className="px-2 py-0.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold shadow-2xs flex items-center space-x-1 transition-colors"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>승인하기</span>
            </button>
          )}
        </div>
      )}

      {/* Post Title */}
      {post.title && (
        <h3 
          onClick={() => onOpenDetail && onOpenDetail(post)}
          className="font-bold text-gray-900 text-sm leading-snug mb-1.5 cursor-pointer hover:text-pink-600 transition-colors"
        >
          {post.title}
        </h3>
      )}

      {/* Post Attachment (Image or Link) */}
      {post.attachment && (
        <div className="my-2.5 rounded-xl overflow-hidden border border-black/5 bg-black/5">
          {post.attachment.type === 'image' && (
            <div 
              onClick={() => onOpenDetail && onOpenDetail(post)} 
              className="cursor-pointer"
            >
              <img 
                src={post.attachment.url} 
                alt={post.attachment.caption || post.title} 
                className="w-full max-h-56 object-cover hover:scale-102 transition-transform duration-300"
                loading="lazy"
              />
              {post.attachment.caption && (
                <p className="p-2 text-[11px] text-gray-600 bg-white/70 italic">
                  {post.attachment.caption}
                </p>
              )}
            </div>
          )}

          {post.attachment.type === 'file' && (
            <div className="p-3 bg-white/80 rounded-xl flex items-center justify-between">
              <div 
                onClick={() => onOpenDetail && onOpenDetail(post)}
                className="flex items-center space-x-2.5 min-w-0 cursor-pointer flex-1"
              >
                <div className="p-2 rounded-lg bg-pink-100 text-pink-600 flex-shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-gray-800 truncate hover:text-pink-600 transition-colors">
                    {post.attachment.name}
                  </p>
                  <p className="text-[10px] text-gray-500">{post.attachment.size}</p>
                </div>
              </div>
              <a
                href={post.attachment.url}
                download={post.attachment.name}
                className="p-1.5 rounded-lg bg-black/5 hover:bg-black/10 text-gray-700 transition-colors flex-shrink-0 ml-2"
                title="다운로드"
                onClick={(e) => e.stopPropagation()}
              >
                <Download className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {post.attachment.type === 'link' && (
            <a 
              href={post.attachment.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2.5 flex items-center justify-between hover:bg-white/80 transition-colors text-xs text-blue-600 font-medium"
            >
              <span className="truncate pr-2">{post.attachment.url}</span>
              <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
            </a>
          )}
        </div>
      )}

      {/* Post Body */}
      {post.body && (
        <p 
          onClick={() => onOpenDetail && onOpenDetail(post)}
          className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap break-words mb-3 font-normal cursor-pointer"
        >
          {post.body}
        </p>
      )}

      {/* Multi-Emoji Active Chips (if any reactions exist) */}
      {Object.keys(reactions).length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {Object.entries(reactions).map(([emoji, count]) => {
            const isUserActive = userReactions.includes(emoji);
            return (
              <button
                key={emoji}
                onClick={() => handleReactionClick(emoji)}
                className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold transition-transform active:scale-90 ${
                  isUserActive
                    ? 'bg-pink-100 text-pink-700 border border-pink-400 font-bold'
                    : 'bg-black/5 hover:bg-black/10 text-gray-600'
                }`}
                title={`${emoji} 반응`}
              >
                <span>{emoji}</span>
                <span>{count}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Footer: Reactions & Comments */}
      <div className="pt-2 border-t border-black/5 flex items-center justify-between text-xs text-gray-500 relative">
        {/* Left: Like & Emoji Picker Button */}
        <div className="flex items-center space-x-1">
          {/* Main Heart Reaction Button */}
          <button
            onClick={() => handleReactionClick('❤️')}
            className={`flex items-center space-x-1.5 px-2 py-1 rounded-full transition-colors ${
              userReactions.includes('❤️') || post.userLiked
                ? 'text-rose-600 bg-rose-50 font-semibold' 
                : 'hover:bg-black/5 text-gray-600'
            }`}
            title="좋아요"
          >
            <Heart className={`w-3.5 h-3.5 ${userReactions.includes('❤️') || post.userLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{post.likes || 0}</span>
          </button>

          {/* Emoji Picker Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-1 rounded-full hover:bg-black/5 text-gray-400 hover:text-gray-700 transition-colors"
              title="이모지 반응 남기기"
            >
              <Smile className="w-3.5 h-3.5" />
            </button>

            {/* Emoji Popover */}
            {showEmojiPicker && (
              <div 
                className="absolute left-0 bottom-full mb-1.5 bg-white rounded-xl shadow-lg border border-gray-100 p-1.5 flex items-center space-x-1 z-30 animate-fadeIn"
                onMouseLeave={() => setShowEmojiPicker(false)}
              >
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      handleReactionClick(emoji);
                      setShowEmojiPicker(false);
                    }}
                    className={`p-1 rounded-lg text-sm hover:scale-125 transition-transform ${
                      userReactions.includes(emoji) ? 'bg-pink-100' : 'hover:bg-gray-100'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Comment Toggle Button */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-1 px-2 py-1 rounded-full hover:bg-black/5 transition-colors"
          title="댓글"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>{post.comments ? post.comments.length : 0}</span>
        </button>
      </div>

      {/* Comments Section (Expandable) */}
      {showComments && (
        <div className="mt-3 pt-3 border-t border-black/5 space-y-2">
          {/* Comments List */}
          {post.comments && post.comments.length > 0 ? (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {post.comments.map((comment) => (
                <div key={comment.id} className="text-[11px] bg-black/5 rounded-lg p-2 group/c relative">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-800">{comment.author}</span>
                    {isAdmin && (
                      <button
                        onClick={() => onDeleteComment(post.id, comment.id)}
                        className="opacity-0 group-hover/c:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                        title="댓글 삭제"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{comment.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-gray-400 italic text-center py-1">첫 번째 댓글을 남겨보세요</p>
          )}

          {/* New Comment Input */}
          <form onSubmit={handleCommentSubmit} className="flex items-center space-x-1 pt-1">
            <input
              type="text"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="댓글 추가..."
              className="flex-1 text-xs px-2.5 py-1.5 rounded-lg bg-white/80 border border-black/10 focus:outline-none focus:ring-1 focus:ring-pink-500"
            />
            <button
              type="submit"
              disabled={!newCommentText.trim()}
              className="p-1.5 rounded-lg bg-pink-500 hover:bg-pink-600 disabled:opacity-40 text-white transition-colors"
            >
              <Send className="w-3 h-3" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
