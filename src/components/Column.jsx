import React, { useState } from 'react';
import { Plus, MoreHorizontal, Trash2, Edit2, Check } from 'lucide-react';
import PostCard from './PostCard';

export default function Column({ 
  section, 
  posts, 
  onAddPost, 
  onEditPost, 
  onDeletePost, 
  onToggleLike, 
  onToggleReaction,
  onOpenDetail,
  onAddComment,
  onDeleteComment,
  onUpdateSectionTitle,
  onDeleteSection,
  onDropPost,
  onDragStartPost,
  onTogglePin,
  onApprove,
  isAdmin
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(section.title);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleTitleSubmit = (e) => {
    e?.preventDefault();
    if (titleInput.trim()) {
      onUpdateSectionTitle(section.id, titleInput.trim());
    }
    setIsEditingTitle(false);
  };

  const handleDragOver = (e) => {
    if (!isAdmin) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    if (!isAdmin) return;
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    if (!isAdmin) return;
    e.preventDefault();
    setIsDragOver(false);
    const postId = e.dataTransfer.getData('text/plain');
    if (postId) {
      onDropPost(postId, section.id);
    }
  };

  return (
    <div className="w-72 sm:w-80 flex-shrink-0 flex flex-col max-h-full rounded-2xl bg-white/70 backdrop-blur-md border border-white/60 shadow-lg shadow-black/5 overflow-hidden transition-all">
      {/* Column Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-black/5 bg-white/40">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {isAdmin && isEditingTitle ? (
            <form onSubmit={handleTitleSubmit} className="flex items-center space-x-1 flex-1">
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                className="w-full px-2 py-0.5 text-sm font-bold bg-white border border-pink-400 rounded-md focus:outline-none"
                autoFocus
                onBlur={handleTitleSubmit}
              />
              <button type="submit" className="text-green-600 p-1 hover:bg-gray-100 rounded">
                <Check className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <div 
              className={`flex items-center space-x-2 flex-1 truncate ${isAdmin ? 'cursor-pointer group' : ''}`}
              onClick={() => {
                if (isAdmin) {
                  setTitleInput(section.title);
                  setIsEditingTitle(true);
                }
              }}
            >
              <h2 className="font-bold text-sm text-gray-800 truncate group-hover:text-pink-600 transition-colors">
                {section.title}
              </h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-black/5 text-gray-500">
                {posts.length}
              </span>
            </div>
          )}
        </div>

        {/* Section Actions (관리자 전용) */}
        {isAdmin && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-black/5 transition-colors"
              title="섹션 설정"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showMenu && (
              <div 
                className="absolute right-0 top-6 w-32 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20"
                onMouseLeave={() => setShowMenu(false)}
              >
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setIsEditingTitle(true);
                  }}
                  className="w-full px-3 py-1.5 text-xs text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>이름 바꾸기</span>
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDeleteSection(section.id);
                  }}
                  className="w-full px-3 py-1.5 text-xs text-left text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>섹션 삭제</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cards List (Droppable area - 관리자만 드롭 가능) */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex-1 overflow-y-auto p-3 transition-colors ${
          isAdmin && isDragOver 
            ? 'bg-pink-100/40 border-2 border-dashed border-pink-400 rounded-xl' 
            : ''
        }`}
      >
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onEdit={onEditPost}
            onDelete={onDeletePost}
            onToggleLike={onToggleLike}
            onToggleReaction={onToggleReaction}
            onOpenDetail={onOpenDetail}
            onAddComment={onAddComment}
            onDeleteComment={onDeleteComment}
            onDragStart={onDragStartPost}
            onTogglePin={onTogglePin}
            onApprove={onApprove}
            isAdmin={isAdmin}
          />
        ))}

        {posts.length === 0 && !isDragOver && (
          <div className="h-28 flex flex-col items-center justify-center text-center p-3 text-gray-400 border border-dashed border-black/10 rounded-xl">
            <span className="text-xs">이 섹션에 게시물이 없습니다</span>
            <span className="text-[11px] text-gray-400 mt-1">아래 버튼을 눌러 추가하세요</span>
          </div>
        )}
      </div>

      {/* Column Footer: Add Post Button (일반 방문자도 작성 가능) */}
      <div className="p-3 border-t border-black/5 bg-white/30">
        <button
          onClick={() => onAddPost(section.id)}
          className="w-full py-2 px-3 rounded-xl bg-white hover:bg-pink-50 active:bg-pink-100 text-gray-700 hover:text-pink-600 border border-black/10 hover:border-pink-300 font-semibold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>게시물 추가</span>
        </button>
      </div>
    </div>
  );
}
