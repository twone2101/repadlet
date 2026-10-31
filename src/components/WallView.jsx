import React, { useState } from 'react';
import PostCard from './PostCard';
import { Plus, Filter } from 'lucide-react';

export default function WallView({
  posts,
  sections,
  onAddPost,
  onEditPost,
  onDeletePost,
  onToggleLike,
  onToggleReaction,
  onOpenDetail,
  onAddComment,
  onDeleteComment,
  onTogglePin,
  onApprove,
  isAdmin
}) {
  const [selectedSectionId, setSelectedSectionId] = useState('all');

  const rawPosts = selectedSectionId === 'all'
    ? posts
    : posts.filter(p => p.sectionId === selectedSectionId);

  // 핀 고정 게시물이 최상단에 오도록 정렬
  const filteredPosts = [...rawPosts].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });

  return (
    <div className="flex-1 min-h-0 flex flex-col h-full overflow-hidden">
      {/* Section Filter Pills Header */}
      <div className="px-6 py-2.5 flex items-center justify-between bg-white/40 backdrop-blur-md border-b border-black/5 flex-shrink-0 overflow-x-auto">
        <div className="flex items-center space-x-1.5 overflow-x-auto py-1">
          <span className="text-xs font-semibold text-gray-500 flex items-center space-x-1 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">섹션:</span>
          </span>
          <button
            onClick={() => setSelectedSectionId('all')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              selectedSectionId === 'all'
                ? 'bg-pink-500 text-white shadow-xs'
                : 'bg-white/70 hover:bg-white text-gray-700 border border-black/5'
            }`}
          >
            전체 보기 ({posts.length})
          </button>
          {sections.map(sec => {
            const count = posts.filter(p => p.sectionId === sec.id).length;
            const isSelected = selectedSectionId === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setSelectedSectionId(sec.id)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-pink-500 text-white shadow-xs'
                    : 'bg-white/70 hover:bg-white text-gray-700 border border-black/5'
                }`}
              >
                {sec.title} ({count})
              </button>
            );
          })}
        </div>

        {/* Add Post Button in current filter */}
        <button
          onClick={() => onAddPost(selectedSectionId === 'all' ? sections[0]?.id : selectedSectionId)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold shadow-xs transition-colors flex-shrink-0 ml-3"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>게시물 추가</span>
        </button>
      </div>

      {/* Masonry / Grid Wall Container */}
      <div className="flex-1 min-h-0 overflow-y-auto p-6 pb-28">
        {filteredPosts.length > 0 ? (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {filteredPosts.map((post) => {
              const sec = sections.find(s => s.id === post.sectionId);
              return (
                <div key={post.id} className="break-inside-avoid">
                  {/* Section Label on top of card in Wall view */}
                  <div className="mb-1 flex items-center justify-between px-1 text-[11px] font-semibold text-gray-600">
                    <span className="px-2 py-0.5 rounded-md bg-white/70 backdrop-blur-xs border border-black/5">
                      {sec?.title || '섹션'}
                    </span>
                  </div>
                  <PostCard
                    post={post}
                    onEdit={onEditPost}
                    onDelete={onDeletePost}
                    onToggleLike={onToggleLike}
                    onToggleReaction={onToggleReaction}
                    onOpenDetail={onOpenDetail}
                    onAddComment={onAddComment}
                    onDeleteComment={onDeleteComment}
                    onTogglePin={onTogglePin}
                    onApprove={onApprove}
                    isAdmin={isAdmin}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center rounded-3xl bg-white/40 backdrop-blur-md border border-white/60 p-6 text-center max-w-md mx-auto mt-12">
            <p className="text-sm font-bold text-gray-700 mb-1">등록된 게시물이 없습니다</p>
            <p className="text-xs text-gray-500 mb-4">선택한 섹션에 새로운 생각이나 과제를 남겨보세요.</p>
            <button
              onClick={() => onAddPost(selectedSectionId === 'all' ? sections[0]?.id : selectedSectionId)}
              className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold shadow-xs transition-colors"
            >
              새 게시물 등록하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
