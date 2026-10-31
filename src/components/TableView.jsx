import React, { useState } from 'react';
import { 
  Plus, 
  Download, 
  ExternalLink, 
  FileText, 
  Image, 
  Heart, 
  MessageCircle, 
  Maximize2,
  Trash2,
  Edit,
  Filter,
  Pin,
  Clock,
  CheckCircle2
} from 'lucide-react';

export default function TableView({
  posts,
  sections,
  onAddPost,
  onEditPost,
  onDeletePost,
  onOpenDetail,
  onTogglePin,
  onApprove,
  isAdmin
}) {
  const [selectedSectionId, setSelectedSectionId] = useState('all');

  const rawPosts = selectedSectionId === 'all'
    ? posts
    : posts.filter(p => p.sectionId === selectedSectionId);

  // 핀 고정 우선 정렬
  const filteredPosts = [...rawPosts].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });

  // Export current table view to CSV
  const handleExportCSV = () => {
    const headers = ['섹션', '제목', '작성자', '내용', '첨부형식', '좋아요수', '댓글수', '작성일시'];
    const rows = filteredPosts.map(p => {
      const sec = sections.find(s => s.id === p.sectionId);
      const attachmentType = p.attachment?.type || '없음';
      const cleanBody = (p.body || '').replace(/"/g, '""').replace(/\n/g, ' ');
      const cleanTitle = (p.title || '').replace(/"/g, '""');
      return [
        `"${sec?.title || ''}"`,
        `"${cleanTitle}"`,
        `"${p.author?.name || ''}"`,
        `"${cleanBody}"`,
        `"${attachmentType}"`,
        p.likes || 0,
        p.comments?.length || 0,
        `"${p.createdAt || ''}"`
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `padlet-table-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Top Filter and Table Actions */}
      <div className="px-6 py-2.5 flex items-center justify-between bg-white/50 backdrop-blur-md border-b border-black/5 flex-shrink-0 overflow-x-auto">
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
                : 'bg-white/80 hover:bg-white text-gray-700 border border-black/5'
            }`}
          >
            전체 ({posts.length})
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
                    : 'bg-white/80 hover:bg-white text-gray-700 border border-black/5'
                }`}
              >
                {sec.title} ({count})
              </button>
            );
          })}
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
          {/* CSV Export Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-gray-100 text-gray-700 text-xs font-bold border border-gray-200 shadow-2xs transition-colors"
            title="현재 테이블을 CSV 파일로 다운로드"
          >
            <Download className="w-3.5 h-3.5 text-pink-600" />
            <span className="hidden sm:inline">CSV 내보내기</span>
          </button>

          {/* Add Post Button */}
          <button
            onClick={() => onAddPost(selectedSectionId === 'all' ? sections[0]?.id : selectedSectionId)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>새 글 추가</span>
          </button>
        </div>
      </div>

      {/* Main Table Content Container */}
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="bg-white/85 backdrop-blur-md rounded-2xl shadow-lg border border-black/10 overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            {/* Table Header */}
            <thead>
              <tr className="bg-gray-100/80 text-gray-700 border-b border-black/10 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-24">섹션</th>
                <th className="py-3 px-4 min-w-[140px]">제목</th>
                <th className="py-3 px-4 w-32">작성자</th>
                <th className="py-3 px-4 min-w-[200px]">본문 내용</th>
                <th className="py-3 px-4 w-32">첨부</th>
                <th className="py-3 px-4 w-20 text-center">반응</th>
                <th className="py-3 px-4 w-20 text-center">댓글</th>
                <th className="py-3 px-4 w-28">작성일</th>
                <th className="py-3 px-4 w-24 text-center">동작</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-black/5">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => {
                  const sec = sections.find(s => s.id === post.sectionId);
                  return (
                    <tr
                      key={post.id}
                      onClick={() => onOpenDetail && onOpenDetail(post)}
                      className="hover:bg-pink-50/50 transition-colors cursor-pointer group"
                    >
                      {/* Section */}
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-pink-100 text-pink-700 border border-pink-200">
                          {sec?.title || '섹션'}
                        </span>
                      </td>

                      {/* Title */}
                      <td className="py-3 px-4 font-bold text-gray-900 group-hover:text-pink-600 transition-colors">
                        <div className="flex items-center space-x-1.5 truncate max-w-xs">
                          {post.pinned && (
                            <Pin className="w-3.5 h-3.5 text-pink-600 fill-pink-500 flex-shrink-0" title="상단 고정됨" />
                          )}
                          {post.approved === false && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center space-x-0.5 flex-shrink-0">
                              <Clock className="w-2.5 h-2.5" />
                              <span>승인대기</span>
                            </span>
                          )}
                          <span className="truncate">{post.title || '(제목 없음)'}</span>
                        </div>
                      </td>

                      {/* Author */}
                      <td className="py-3 px-4 text-gray-700">
                        <div className="flex items-center space-x-1.5 truncate">
                          <img
                            src={post.author?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                            alt=""
                            className="w-5 h-5 rounded-full object-cover border border-gray-200 flex-shrink-0"
                          />
                          <span className="truncate font-medium">{post.author?.name || '익명'}</span>
                        </div>
                      </td>

                      {/* Body snippet */}
                      <td className="py-3 px-4 text-gray-600 max-w-sm">
                        <p className="truncate">{post.body || '-'}</p>
                      </td>

                      {/* Attachment */}
                      <td className="py-3 px-4 text-gray-600">
                        {post.attachment ? (
                          <div className="flex items-center space-x-1 truncate text-[11px]">
                            {post.attachment.type === 'image' && (
                              <span className="flex items-center space-x-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                <Image className="w-3 h-3" />
                                <span>이미지</span>
                              </span>
                            )}
                            {post.attachment.type === 'file' && (
                              <span className="flex items-center space-x-1 text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200 truncate max-w-[100px]">
                                <FileText className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{post.attachment.name}</span>
                              </span>
                            )}
                            {post.attachment.type === 'link' && (
                              <span className="flex items-center space-x-1 text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                                <ExternalLink className="w-3 h-3" />
                                <span>링크</span>
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>

                      {/* Reactions */}
                      <td className="py-3 px-4 text-center font-semibold text-rose-600">
                        <span className="inline-flex items-center space-x-1">
                          <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                          <span>{post.likes || 0}</span>
                        </span>
                      </td>

                      {/* Comments */}
                      <td className="py-3 px-4 text-center text-gray-600">
                        <span className="inline-flex items-center space-x-1">
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>{post.comments?.length || 0}</span>
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-gray-500 text-[11px] whitespace-nowrap">
                        {formatDate(post.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => onOpenDetail && onOpenDetail(post)}
                            className="p-1 rounded hover:bg-pink-100 text-gray-500 hover:text-pink-600 transition-colors"
                            title="상세 보기"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                          {isAdmin && (
                            <>
                              {post.approved === false && onApprove && (
                                <button
                                  onClick={() => onApprove(post.id)}
                                  className="p-1 rounded hover:bg-emerald-100 text-emerald-600 transition-colors"
                                  title="승인하기"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {onTogglePin && (
                                <button
                                  onClick={() => onTogglePin(post.id)}
                                  className={`p-1 rounded hover:bg-pink-100 transition-colors ${post.pinned ? 'text-pink-600' : 'text-gray-400 hover:text-pink-600'}`}
                                  title={post.pinned ? "고정 해제" : "상단 고정"}
                                >
                                  <Pin className={`w-3.5 h-3.5 ${post.pinned ? 'fill-pink-500' : ''}`} />
                                </button>
                              )}
                              <button
                                onClick={() => onEditPost(post)}
                                className="p-1 rounded hover:bg-blue-100 text-blue-600 transition-colors"
                                title="수정"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm('이 게시물을 삭제하시겠습니까?')) {
                                    onDeletePost(post.id);
                                  }
                                }}
                                className="p-1 rounded hover:bg-red-100 text-red-600 transition-colors"
                                title="삭제"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400">
                    표시할 게시물이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
