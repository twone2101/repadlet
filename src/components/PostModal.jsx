import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Image, 
  Link2, 
  PenTool, 
  Check, 
  Upload, 
  Trash, 
  Search, 
  Paperclip, 
  FileText, 
  Loader2, 
  Sparkles,
  Download
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { COLOR_PALETTE, filterProfanity } from '../data/initialData';

// Curated high-res educational & technology stock images by category
const CURATED_IMAGE_COLLECTIONS = {
  '학교': [
    { url: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&auto=format&fit=crop&q=80", title: "학교 교실과 칠판" },
    { url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80", title: "선생님과 학생 수업" },
    { url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80", title: "책과 도서관" },
    { url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80", title: "학생들의 조별 토론" }
  ],
  '코딩': [
    { url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80", title: "소프트웨어 리버스 엔지니어링" },
    { url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80", title: "프로그래밍 소스 코드" },
    { url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80", title: "사이버 보안 매트릭스" },
    { url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80", title: "컴퓨터 연구실 실습" }
  ],
  '과학': [
    { url: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=800&auto=format&fit=crop&q=80", title: "과학 실험실 현미경" },
    { url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=80", title: "화학 반응 비커" },
    { url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80", title: "우주와 지구" },
    { url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80", title: "인공지능 신경망 아트" }
  ],
  '자연': [
    { url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80", title: "아름다운 안개 산맥" },
    { url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80", title: "에메랄드빛 해변" },
    { url: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&auto=format&fit=crop&q=80", title: "숲속의 햇살" },
    { url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80", title: "오로라 밤하늘" }
  ]
};

const SUGGESTED_KEYWORDS = ['학교', '코딩', '과학', '자연', '컴퓨터', '인공지능', '도서관', '우주'];

export default function PostModal({ 
  isOpen, 
  onClose, 
  onSave, 
  editingPost, 
  sectionId, 
  sections,
  board,
  isAdmin
}) {
  if (!isOpen) return null;

  const [title, setTitle] = useState(editingPost?.title || '');
  const [body, setBody] = useState(editingPost?.body || '');
  const [authorName, setAuthorName] = useState(editingPost?.author?.name || '대전둔산중학교');
  const [selectedColor, setSelectedColor] = useState(editingPost?.color || '#ffffff');
  const [targetSectionId, setTargetSectionId] = useState(editingPost?.sectionId || sectionId);
  
  // Active modal tabs: 'none' | 'image' | 'file' | 'link' | 'draw'
  const [activeTab, setActiveTab] = useState('none');

  // Image sub-tabs: 'search' | 'upload' | 'url'
  const [imageSubTab, setImageSubTab] = useState('search');

  // Attachment states
  const [attachment, setAttachment] = useState(editingPost?.attachment || null);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageCaptionInput, setImageCaptionInput] = useState('');
  const [linkUrlInput, setLinkUrlInput] = useState('');

  // Web image search states
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(CURATED_IMAGE_COLLECTIONS['학교']);

  // Drawing canvas states
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(4);

  // Canvas drawing handlers
  useEffect(() => {
    if (activeTab === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [activeTab]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const saveDrawingToAttachment = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    setAttachment({
      type: 'image',
      url: dataUrl,
      caption: '캔버스 스케치 드로잉'
    });
    setActiveTab('none');
  };

  // Image File Upload handler
  const handleImageFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachment({
          type: 'image',
          url: event.target.result,
          caption: file.name
        });
        setActiveTab('none');
      };
      reader.readAsDataURL(file);
    }
  };

  // General File (PDF, DOCX, ZIP, etc.) Upload handler
  const handleGeneralFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        // Calculate readable file size
        const sizeInKb = file.size / 1024;
        const sizeFormatted = sizeInKb > 1024 
          ? (sizeInKb / 1024).toFixed(1) + ' MB' 
          : Math.round(sizeInKb) + ' KB';

        setAttachment({
          type: 'file',
          url: event.target.result,
          name: file.name,
          size: sizeFormatted,
          fileType: file.type || 'application/octet-stream'
        });
        setActiveTab('none');
      };
      reader.readAsDataURL(file);
    }
  };

  // Web Image Search handler (Queries Wikimedia Commons API with fallback to curated library)
  const handleSearchImages = async (e, keywordOverride) => {
    e?.preventDefault();
    const term = (keywordOverride || searchQuery).trim();
    if (!term) return;

    setIsSearching(true);

    try {
      // 1. Try Wikimedia Commons Open API with CORS origin=*
      const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(term)}&gsrlimit=12&prop=imageinfo&iiprop=url|thumburl&iiurlwidth=500&format=json&origin=*`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.query?.pages) {
        const pages = Object.values(data.query.pages);
        const results = pages
          .filter(p => p.imageinfo && p.imageinfo[0] && (p.imageinfo[0].thumburl || p.imageinfo[0].url))
          .map(p => ({
            url: p.imageinfo[0].thumburl || p.imageinfo[0].url,
            title: p.title.replace(/^File:/, '').replace(/\.[^/.]+$/, '').substring(0, 35)
          }));

        if (results.length > 0) {
          setSearchResults(results);
          setIsSearching(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Wikimedia API query failed, falling back to curated collections:', err);
    }

    // 2. Fallback to Curated collections or dynamic Unsplash query
    if (CURATED_IMAGE_COLLECTIONS[term]) {
      setSearchResults(CURATED_IMAGE_COLLECTIONS[term]);
    } else {
      // Generate topic-based high quality Unsplash images
      const fallbackList = [
        { url: `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80`, title: `${term} 관련 이미지 1` },
        { url: `https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80`, title: `${term} 관련 이미지 2` },
        { url: `https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80`, title: `${term} 관련 이미지 3` },
        { url: `https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80`, title: `${term} 관련 이미지 4` }
      ];
      setSearchResults(fallbackList);
    }
    setIsSearching(false);
  };

  const handleImageSubmit = (e) => {
    e?.preventDefault();
    if (imageUrlInput.trim()) {
      setAttachment({
        type: 'image',
        url: imageUrlInput.trim(),
        caption: imageCaptionInput.trim() || ''
      });
      setImageUrlInput('');
      setImageCaptionInput('');
      setActiveTab('none');
    }
  };

  const handleLinkSubmit = (e) => {
    e?.preventDefault();
    if (linkUrlInput.trim()) {
      let finalUrl = linkUrlInput.trim();
      if (!/^https?:\/\//i.test(finalUrl)) {
        finalUrl = 'https://' + finalUrl;
      }
      setAttachment({
        type: 'link',
        url: finalUrl
      });
      setLinkUrlInput('');
      setActiveTab('none');
    }
  };

  const handlePublish = (e) => {
    e.preventDefault();
    if (!title.trim() && !body.trim() && !attachment) {
      alert('제목 또는 내용, 또는 첨부파일을 입력해주세요.');
      return;
    }

    // 비속어 필터링 적용 (board.filterProfanity가 true일 때)
    const shouldFilter = board?.filterProfanity !== false;
    const finalTitle = shouldFilter ? filterProfanity(title.trim()) : title.trim();
    const finalBody = shouldFilter ? filterProfanity(body.trim()) : body.trim();

    // 교사 승인제 (Require Approval) 적용
    // 관리자가 작성하면 항상 승인(true), 일반 사용자이고 requireApproval이 켜져있으면 approved = false
    const isApproved = editingPost 
      ? (editingPost.approved !== undefined ? editingPost.approved : true) 
      : (!board?.requireApproval || isAdmin);

    const postData = {
      id: editingPost?.id || 'post_' + Date.now(),
      sectionId: targetSectionId,
      title: finalTitle,
      body: finalBody,
      color: selectedColor,
      author: {
        name: authorName.trim() || '익명',
        avatar: editingPost?.author?.avatar || 'https://genai-public.padletcdn.com/disco/prod/imagen/1770117425695/sample_0.png'
      },
      createdAt: editingPost?.createdAt || new Date().toISOString(),
      likes: editingPost?.likes || 0,
      userLiked: editingPost?.userLiked || false,
      reactions: editingPost?.reactions || {},
      userReactions: editingPost?.userReactions || [],
      comments: editingPost?.comments || [],
      attachment: attachment,
      pinned: editingPost?.pinned || false,
      pinnedAt: editingPost?.pinnedAt || null,
      approved: isApproved
    };

    onSave(postData);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {}

    if (!isApproved) {
      alert('게시물이 등록되었습니다!\n선생님(관리자)의 승인 후 다른 모든 사용자에게 공개됩니다.');
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        style={{ backgroundColor: selectedColor }}
        className="w-full max-w-lg rounded-3xl shadow-2xl border border-black/10 overflow-hidden flex flex-col max-h-[92vh] transition-colors duration-200"
      >
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-black/10 bg-white/40">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-pink-500 text-white">
              {editingPost ? '게시물 수정' : '새 게시물 작성'}
            </span>
            <select
              value={targetSectionId}
              onChange={(e) => setTargetSectionId(e.target.value)}
              className="text-xs font-medium px-2 py-1 rounded-lg bg-white/80 border border-black/10 focus:outline-none"
            >
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/5 text-gray-500 hover:text-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Author Name */}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="작성자 이름"
              className="text-xs font-medium px-2.5 py-1 rounded-lg bg-black/5 border border-transparent focus:bg-white focus:border-pink-400 focus:outline-none"
            />
          </div>

          {/* Title Input */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목"
            className="w-full text-lg font-bold bg-transparent placeholder-gray-400 border-b border-black/10 pb-2 focus:outline-none focus:border-pink-500"
            autoFocus
          />

          {/* Body Textarea */}
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="무언가를 적어보세요..."
            rows={3}
            className="w-full text-sm bg-transparent placeholder-gray-400 resize-none focus:outline-none leading-relaxed"
          />

          {/* Existing Attachment Preview */}
          {attachment && (
            <div className="relative rounded-2xl overflow-hidden border border-black/10 bg-white/60 p-2 group">
              <button
                type="button"
                onClick={() => setAttachment(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-red-600 text-white shadow-md hover:bg-red-700 transition-colors z-10"
                title="첨부 삭제"
              >
                <Trash className="w-3.5 h-3.5" />
              </button>

              {/* Image Preview */}
              {attachment.type === 'image' && (
                <div>
                  <img src={attachment.url} alt="첨부 이미지" className="w-full max-h-48 object-cover rounded-xl" />
                  {attachment.caption && (
                    <p className="text-xs text-gray-600 mt-2 px-1 italic">{attachment.caption}</p>
                  )}
                </div>
              )}

              {/* File Preview */}
              {attachment.type === 'file' && (
                <div className="flex items-center space-x-3 p-3 bg-white/80 rounded-xl">
                  <div className="p-2.5 rounded-xl bg-pink-100 text-pink-600">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-900 truncate">{attachment.name}</p>
                    <p className="text-[11px] text-gray-500">{attachment.size}</p>
                  </div>
                </div>
              )}

              {/* Link Preview */}
              {attachment.type === 'link' && (
                <div className="flex items-center space-x-2 p-2">
                  <Link2 className="w-4 h-4 text-blue-500" />
                  <a href={attachment.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline truncate">
                    {attachment.url}
                  </a>
                </div>
              )}
            </div>
          )}

          {/* 1. IMAGE ATTACHMENT PANEL (Web Search / Upload / URL) */}
          {activeTab === 'image' && (
            <div className="p-4 rounded-2xl bg-white/95 border border-black/10 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                {/* Sub-tabs */}
                <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-xl text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setImageSubTab('search')}
                    className={`px-2.5 py-1 rounded-lg transition-colors flex items-center space-x-1 ${
                      imageSubTab === 'search' ? 'bg-white text-pink-600 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Search className="w-3 h-3" />
                    <span>인터넷 검색</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageSubTab('upload')}
                    className={`px-2.5 py-1 rounded-lg transition-colors flex items-center space-x-1 ${
                      imageSubTab === 'upload' ? 'bg-white text-pink-600 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Upload className="w-3 h-3" />
                    <span>내 파일</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageSubTab('url')}
                    className={`px-2.5 py-1 rounded-lg transition-colors flex items-center space-x-1 ${
                      imageSubTab === 'url' ? 'bg-white text-pink-600 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Link2 className="w-3 h-3" />
                    <span>웹 링크</span>
                  </button>
                </div>

                <button onClick={() => setActiveTab('none')} className="text-xs text-gray-400 hover:text-gray-700">✕ 닫기</button>
              </div>

              {/* Sub-tab 1: Web Image Search */}
              {imageSubTab === 'search' && (
                <div className="space-y-3">
                  <form onSubmit={handleSearchImages} className="flex items-center space-x-1.5">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="키워드로 이미지 검색 (예: 학교, 인공지능, 코딩...)"
                        className="w-full text-xs pl-8 pr-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-pink-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSearching || !searchQuery.trim()}
                      className="px-3.5 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold transition-colors disabled:opacity-40 flex items-center space-x-1"
                    >
                      {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>검색</span>}
                    </button>
                  </form>

                  {/* Suggested Keywords tags */}
                  <div className="flex flex-wrap gap-1">
                    {SUGGESTED_KEYWORDS.map((kw) => (
                      <button
                        key={kw}
                        type="button"
                        onClick={(e) => {
                          setSearchQuery(kw);
                          handleSearchImages(e, kw);
                        }}
                        className="px-2 py-0.5 rounded-lg bg-gray-100 hover:bg-pink-50 hover:text-pink-600 text-[11px] font-medium text-gray-600 transition-colors"
                      >
                        #{kw}
                      </button>
                    ))}
                  </div>

                  {/* Search Results Grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                    {searchResults.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setAttachment({
                            type: 'image',
                            url: item.url,
                            caption: item.title
                          });
                          setActiveTab('none');
                        }}
                        className="group relative h-20 rounded-xl overflow-hidden border border-black/10 cursor-pointer hover:border-pink-500 transition-all"
                        title={item.title}
                      >
                        <img 
                          src={item.url} 
                          alt={item.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                          loading="lazy" 
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1">
                          <span className="text-[10px] text-white font-medium truncate drop-shadow">{item.title}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-tab 2: Local Image Upload */}
              {imageSubTab === 'upload' && (
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 hover:border-pink-500 rounded-2xl cursor-pointer bg-gray-50/50 hover:bg-pink-50/30 transition-all">
                  <Upload className="w-8 h-8 text-pink-500 mb-2" />
                  <span className="text-xs font-bold text-gray-700">내 컴퓨터에서 이미지 선택</span>
                  <span className="text-[11px] text-gray-400 mt-0.5">PNG, JPG, GIF 지원</span>
                  <input type="file" accept="image/*" onChange={handleImageFileUpload} className="hidden" />
                </label>
              )}

              {/* Sub-tab 3: Image URL input */}
              {imageSubTab === 'url' && (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="이미지 웹 주소 (https://...)"
                    className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-pink-500"
                  />
                  <input
                    type="text"
                    value={imageCaptionInput}
                    onChange={(e) => setImageCaptionInput(e.target.value)}
                    placeholder="이미지 설명 / 캡션 (선택)"
                    className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-pink-500"
                  />
                  <button
                    type="button"
                    onClick={handleImageSubmit}
                    disabled={!imageUrlInput.trim()}
                    className="w-full py-2 rounded-xl bg-pink-500 text-white text-xs font-semibold hover:bg-pink-600 disabled:opacity-40"
                  >
                    이미지 적용
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 2. GENERAL FILE ATTACHMENT PANEL (PDF, DOCX, ZIP, etc.) */}
          {activeTab === 'file' && (
            <div className="p-4 rounded-2xl bg-white/95 border border-black/10 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-gray-800">
                  <Paperclip className="w-4 h-4 text-pink-500" />
                  <span>문서 및 파일 첨부</span>
                </div>
                <button onClick={() => setActiveTab('none')} className="text-xs text-gray-400 hover:text-gray-700">✕ 닫기</button>
              </div>

              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 hover:border-pink-500 rounded-2xl cursor-pointer bg-gray-50/50 hover:bg-pink-50/30 transition-all">
                <FileText className="w-8 h-8 text-pink-500 mb-2" />
                <span className="text-xs font-bold text-gray-800">컴퓨터에서 파일 업로드</span>
                <span className="text-[11px] text-gray-400 mt-1">PDF, Word, HWP, PPT, Excel, ZIP, TXT 등 모든 형식 지원</span>
                <input 
                  type="file" 
                  onChange={handleGeneralFileUpload} 
                  className="hidden" 
                />
              </label>
            </div>
          )}

          {/* 3. LINK ATTACHMENT PANEL */}
          {activeTab === 'link' && (
            <div className="p-4 rounded-2xl bg-white/95 border border-black/10 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700">웹 링크 첨부</span>
                <button onClick={() => setActiveTab('none')} className="text-xs text-gray-400 hover:text-gray-700">✕ 닫기</button>
              </div>
              <input
                type="text"
                value={linkUrlInput}
                onChange={(e) => setLinkUrlInput(e.target.value)}
                placeholder="https://example.com"
                className="w-full text-xs px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-1 focus:ring-pink-500"
              />
              <button
                type="button"
                onClick={handleLinkSubmit}
                disabled={!linkUrlInput.trim()}
                className="w-full py-2 rounded-xl bg-pink-500 text-white text-xs font-semibold hover:bg-pink-600 disabled:opacity-40"
              >
                링크 첨부하기
              </button>
            </div>
          )}

          {/* 4. DOODLE / DRAWING CANVAS PANEL */}
          {activeTab === 'draw' && (
            <div className="p-4 rounded-2xl bg-white/95 border border-black/10 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700">그리기 캔버스 (Doodle)</span>
                <button onClick={() => setActiveTab('none')} className="text-xs text-gray-400 hover:text-gray-700">✕ 닫기</button>
              </div>

              {/* Drawing Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  {['#000000', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setBrushColor(color)}
                      style={{ backgroundColor: color }}
                      className={`w-5 h-5 rounded-full border ${brushColor === color ? 'ring-2 ring-pink-500 scale-110' : ''}`}
                    />
                  ))}
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] text-gray-500">굵기:</span>
                  {[2, 4, 8].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setBrushSize(size)}
                      className={`px-1.5 py-0.5 text-xs rounded border ${brushSize === size ? 'bg-gray-800 text-white' : 'bg-white'}`}
                    >
                      {size}px
                    </button>
                  ))}
                </div>
              </div>

              {/* Canvas Element */}
              <canvas
                ref={canvasRef}
                width={400}
                height={200}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="w-full h-48 border border-gray-300 rounded-xl bg-white cursor-crosshair shadow-inner"
              />

              <button
                type="button"
                onClick={saveDrawingToAttachment}
                className="w-full py-2 rounded-xl bg-pink-500 text-white text-xs font-semibold hover:bg-pink-600"
              >
                그림 저장하여 첨부하기
              </button>
            </div>
          )}

          {/* Color Palette Selector */}
          <div>
            <span className="text-[11px] font-semibold text-gray-500 mb-2 block">포스트 색상:</span>
            <div className="flex items-center space-x-2">
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setSelectedColor(c.bg)}
                  style={{ backgroundColor: c.bg, borderColor: c.border }}
                  className={`w-7 h-7 rounded-full border-2 transition-transform shadow-xs flex items-center justify-center ${
                    selectedColor === c.bg ? 'scale-115 ring-2 ring-pink-500 ring-offset-1' : 'hover:scale-105'
                  }`}
                  title={c.name}
                >
                  {selectedColor === c.bg && <Check className="w-3.5 h-3.5 text-gray-700" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions: Media triggers */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-black/10 bg-white/40">
          {/* Quick Attachment Triggers */}
          <div className="flex items-center space-x-2">
            {/* Image (Search / Upload) */}
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'image' ? 'none' : 'image')}
              className={`p-2 rounded-xl border transition-colors flex items-center space-x-1.5 ${
                activeTab === 'image' ? 'bg-pink-100 border-pink-400 text-pink-600' : 'bg-white/80 border-black/10 hover:bg-white text-gray-600'
              }`}
              title="사진 / 이미지 검색 및 첨부"
            >
              <Image className="w-4 h-4" />
              <span className="text-xs font-semibold hidden sm:inline">사진/검색</span>
            </button>

            {/* File Upload (PDF, Docs, etc.) */}
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'file' ? 'none' : 'file')}
              className={`p-2 rounded-xl border transition-colors flex items-center space-x-1.5 ${
                activeTab === 'file' ? 'bg-pink-100 border-pink-400 text-pink-600' : 'bg-white/80 border-black/10 hover:bg-white text-gray-600'
              }`}
              title="문서 및 파일 첨부"
            >
              <Paperclip className="w-4 h-4" />
              <span className="text-xs font-semibold hidden sm:inline">파일</span>
            </button>

            {/* Link */}
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'link' ? 'none' : 'link')}
              className={`p-2 rounded-xl border transition-colors ${
                activeTab === 'link' ? 'bg-pink-100 border-pink-400 text-pink-600' : 'bg-white/80 border-black/10 hover:bg-white text-gray-600'
              }`}
              title="링크 첨부"
            >
              <Link2 className="w-4 h-4" />
            </button>

            {/* Drawing */}
            <button
              type="button"
              onClick={() => setActiveTab(activeTab === 'draw' ? 'none' : 'draw')}
              className={`p-2 rounded-xl border transition-colors ${
                activeTab === 'draw' ? 'bg-pink-100 border-pink-400 text-pink-600' : 'bg-white/80 border-black/10 hover:bg-white text-gray-600'
              }`}
              title="그리기 (스케치)"
            >
              <PenTool className="w-4 h-4" />
            </button>
          </div>

          {/* Publish / Save Button */}
          <button
            type="button"
            onClick={handlePublish}
            className="px-6 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 active:bg-pink-700 text-white font-bold text-sm shadow-md transition-all transform active:scale-95"
          >
            {editingPost ? '저장' : '게시'}
          </button>
        </div>
      </div>
    </div>
  );
}
