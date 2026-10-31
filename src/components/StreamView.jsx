import React, { useState } from 'react';
import PostCard from './PostCard';
import { Plus, Filter, Sparkles, MessageCircle } from 'lucide-react';

export default function StreamView({
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

  // Sort posts: 핀 고정 우선, 그 다음 최신순
  const sortedPosts = [...posts].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  const filteredPosts = selectedSectionId === 'all'
    ? sortedPosts
    : sortedPosts.filter(p => p.sectionId === selectedSectionId);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Section Filter Pills */}
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
            전체 피드 ({posts.length})
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

        <button
          onClick={() => onAddPost(selectedSectionId === 'all' ? sections[0]?.id : selectedSectionId)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold shadow-xs transition-colors flex-shrink-0 ml-3"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>게시물 작성</span>
        </button>
      </div>

      {/* Vertical Feed Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="max-w-xl mx-auto space-y-6 pb-24">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => {
              const sec = sections.find(s => s.id === post.sectionId);
              return (
                <div key={post.id} className="transition-all">
                  <div className="mb-1.5 flex items-center justify-between px-2 text-xs font-semibold text-gray-600">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/80 backdrop-blur-xs text-pink-700 border border-pink-200/50 shadow-2xs">
                      {sec?.title || '섹션'}
                    </span>
                    <span className="text-[11px] text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
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
            })
          ) : (
            <div className="h-64 flex flex-col items-center justify-center rounded-3xl bg-white/40 backdrop-blur-md border border-white/60 p-6 text-center mt-12">
              <p className="text-sm font-bold text-gray-700 mb-1">피드에 게시물이 없습니다</p>
              <p className="text-xs text-gray-500 mb-4">첫 번째 게시물을 남겨 피드를 채워보세요.</p>
              <button
                onClick={() => onAddPost(selectedSectionId === 'all' ? sections[0]?.id : selectedSectionId)}
                className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold shadow-xs transition-colors"
              >
                게시물 작성하기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
