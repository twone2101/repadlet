import React, { useState } from 'react';
import { X, Sparkles, LayoutGrid, Check, BookOpen, Users, HelpCircle, MessageSquare } from 'lucide-react';

const BOARD_TEMPLATES = [
  {
    id: 'groups_4',
    name: '4개 모둠 수업 (기본)',
    desc: '1모둠, 2모둠, 3모둠, 4모둠으로 구성된 협동학습형 보드',
    icon: Users,
    sections: [
      { id: 'sec_1', title: '1모둠', sort_index: 1 },
      { id: 'sec_2', title: '2모둠', sort_index: 2 },
      { id: 'sec_3', title: '3모둠', sort_index: 3 },
      { id: 'sec_4', title: '4모둠', sort_index: 4 },
    ]
  },
  {
    id: 'debate',
    name: '찬반 토론 수업',
    desc: '찬성 의견, 반대 의견, 질문 및 중립 의견',
    icon: MessageSquare,
    sections: [
      { id: 'sec_1', title: '👍 찬성 의견', sort_index: 1 },
      { id: 'sec_2', title: '👎 반대 의견', sort_index: 2 },
      { id: 'sec_3', title: '💬 질문 및 기타 의견', sort_index: 3 },
    ]
  },
  {
    id: 'kwl',
    name: 'K-W-L 탐구 활동',
    desc: '알고 있는 것(K), 알고 싶은 것(W), 배운 것(L)',
    icon: BookOpen,
    sections: [
      { id: 'sec_1', title: '💡 이미 알고 있는 것 (K)', sort_index: 1 },
      { id: 'sec_2', title: '❓ 알고 싶은 것 (W)', sort_index: 2 },
      { id: 'sec_3', title: '✨ 새롭게 배운 점 (L)', sort_index: 3 },
    ]
  },
  {
    id: 'empty',
    name: '빈 보드 (직접 구성)',
    desc: '섹션 없이 생성하여 교사가 직접 자유롭게 추가',
    icon: HelpCircle,
    sections: []
  }
];

const BACKGROUND_PRESETS = [
  {
    name: "따뜻한 원목 교실",
    url: "https://elvis.padletcdn.com/1/atat/e_in-u_1773398369/appbR1Qbe0DGnDKkS/tblhZFRy95OZHncLj/recz2nYoEtLTScVy8/fldJu5JvkUBo8MUFA",
    preview: "#8B5A2B"
  },
  {
    name: "칠판 그린",
    url: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1600&auto=format&fit=crop&q=80",
    preview: "#2D5A27"
  },
  {
    name: "깔끔한 화이트/블루",
    url: "https://images.unsplash.com/photo-1518655048521-f130df041f66?w=1600&auto=format&fit=crop&q=80",
    preview: "#4A90E2"
  },
  {
    name: "창의적인 코르크보드",
    url: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=1600&auto=format&fit=crop&q=80",
    preview: "#C89D7C"
  }
];

export default function CreateBoardModal({ isOpen, onClose, onCreateBoard }) {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('groups_4');
  const [selectedBgIndex, setSelectedBgIndex] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('반 이름 또는 수업 보드 제목을 입력해주세요.');
      return;
    }

    const templateObj = BOARD_TEMPLATES.find(t => t.id === selectedTemplate) || BOARD_TEMPLATES[0];
    const bg = BACKGROUND_PRESETS[selectedBgIndex];

    const newBoardId = 'board_' + Date.now();
    const newBoardData = {
      id: newBoardId,
      title: title.trim(),
      description: description.trim() || '우리 반 패들렛 보드에 자유롭게 의견을 나눠보세요!',
      builder: {
        name: "선생님",
        username: "teacher",
        avatar: "https://genai-public.padletcdn.com/disco/prod/imagen/1770117425695/sample_0.png"
      },
      background: {
        type: "image",
        url: bg.url,
        name: bg.name
      },
      layout: "shelf",
      fontTheme: "default",
      requireApproval: false,
      filterProfanity: true,
      isLocked: false,
      createdAt: new Date().toISOString()
    };

    // Prepare sections with unique IDs
    const initialSections = templateObj.sections.map((sec, idx) => ({
      id: `sec_${Date.now()}_${idx}`,
      hashid: `sec_${Math.random().toString(36).substring(2, 9)}`,
      title: sec.title,
      sort_index: sec.sort_index,
      boardId: newBoardId
    }));

    onCreateBoard(newBoardData, initialSections);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl rounded-3xl bg-white shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-pink-500 text-white flex items-center justify-center font-bold shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">새 패들렛 보드 생성</h2>
              <p className="text-xs text-gray-500">수업에 활용할 새로운 반별 패들렛 보드를 만듭니다.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Title & Description */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                반 또는 수업 제목 <span className="text-pink-500">*</span>
              </label>
              <input 
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 1학년 2반 도덕, 2학년 역사 탐구 등"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400/50"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                수업 안내 및 설명 (선택)
              </label>
              <input 
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="예: 모둠별로 탐구한 결과를 카드에 적어주세요!"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-400/50"
              />
            </div>
          </div>

          {/* Template Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              수업용 모둠/섹션 템플릿 선택
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {BOARD_TEMPLATES.map((tmpl) => {
                const IconComponent = tmpl.icon;
                const isSelected = selectedTemplate === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => setSelectedTemplate(tmpl.id)}
                    className={`p-3 text-left rounded-2xl border transition-all flex flex-col justify-between ${
                      isSelected 
                        ? 'border-pink-500 bg-pink-50/70 ring-2 ring-pink-500/20' 
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs font-bold text-gray-900">{tmpl.name}</h4>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-pink-600" />}
                    </div>
                    <p className="text-[11px] text-gray-500 mt-2">{tmpl.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Background Preset Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              배경 테마 선택
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {BACKGROUND_PRESETS.map((bg, idx) => {
                const isSelected = selectedBgIndex === idx;
                return (
                  <button
                    key={bg.name}
                    type="button"
                    onClick={() => setSelectedBgIndex(idx)}
                    className={`relative rounded-xl overflow-hidden border-2 h-16 flex items-end p-2 transition-all ${
                      isSelected ? 'border-pink-500 ring-2 ring-pink-500/20' : 'border-gray-200 hover:opacity-90'
                    }`}
                    style={{
                      backgroundImage: `url(${bg.url})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    <div className="absolute inset-0 bg-black/30 backdrop-blur-[0.5px]" />
                    <span className="relative z-10 text-[10px] font-bold text-white drop-shadow truncate">
                      {bg.name}
                    </span>
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-pink-500 text-white flex items-center justify-center z-10">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 active:bg-pink-700 text-white text-xs font-bold shadow-md shadow-pink-500/20 transition-all"
            >
              새 패들렛 보드 생성하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
