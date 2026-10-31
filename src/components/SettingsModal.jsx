import React, { useState } from 'react';
import { X, Check, ShieldCheck, ShieldAlert, Type } from 'lucide-react';
import { BACKGROUND_PRESETS, FONT_PRESETS } from '../data/initialData';

export default function SettingsModal({ 
  isOpen, 
  onClose, 
  board, 
  onUpdateBoard 
}) {
  if (!isOpen) return null;

  const [title, setTitle] = useState(board.title || '');
  const [authorName, setAuthorName] = useState(board.builder?.name || '');
  const [backgroundUrl, setBackgroundUrl] = useState(board.background?.url || '');
  const [customBgInput, setCustomBgInput] = useState('');
  const [fontTheme, setFontTheme] = useState(board.fontTheme || 'default');
  const [requireApproval, setRequireApproval] = useState(board.requireApproval || false);
  const [filterProfanitySetting, setFilterProfanitySetting] = useState(board.filterProfanity !== false);

  const handleSave = (e) => {
    e.preventDefault();
    onUpdateBoard({
      ...board,
      title: title.trim() || board.title,
      builder: {
        ...board.builder,
        name: authorName.trim() || board.builder.name
      },
      background: {
        ...board.background,
        url: backgroundUrl
      },
      fontTheme,
      requireApproval,
      filterProfanity: filterProfanitySetting
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">패들렛 설정</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Title */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1.5 text-xs">보드 제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
            />
          </div>

          {/* Author Name */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1.5 text-xs">소유자 / 작성자 이름</label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
            />
          </div>

          {/* Font Theme Selector */}
          <div>
            <label className="flex items-center space-x-1.5 font-semibold text-gray-700 mb-2 text-xs">
              <Type className="w-3.5 h-3.5 text-pink-600" />
              <span>글꼴 (폰트 테마)</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {FONT_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setFontTheme(preset.id)}
                  style={{ fontFamily: preset.fontFamily }}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    fontTheme === preset.id
                      ? 'border-pink-500 bg-pink-50 text-pink-700 font-bold ring-2 ring-pink-300'
                      : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                  }`}
                >
                  <div className="text-sm font-semibold">{preset.name}</div>
                  <div className="text-[10px] text-gray-400 truncate">{preset.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Moderation & Content Controls */}
          <div className="space-y-3 pt-2 border-t border-gray-100">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">콘텐츠 & 게시 관리</h3>
            
            {/* Require Approval Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="pr-3">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-gray-800">
                  <ShieldCheck className="w-4 h-4 text-pink-600" />
                  <span>교사 승인제 (Require Approval)</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  방문자가 등록한 게시물을 관리자가 승인해야 다른 사람에게 공개됩니다.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRequireApproval(!requireApproval)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  requireApproval ? 'bg-pink-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    requireApproval ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Filter Profanity Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="pr-3">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-gray-800">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  <span>비속어 필터링 (Filter Profanity)</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  부적절한 단어나 욕설이 포함된 경우 자동으로 기호(***)로 치환합니다.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFilterProfanitySetting(!filterProfanitySetting)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  filterProfanitySetting ? 'bg-pink-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    filterProfanitySetting ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Background Wallpaper Presets */}
          <div className="pt-2 border-t border-gray-100">
            <label className="block font-semibold text-gray-700 mb-2 text-xs">배경화면 선택</label>
            <div className="grid grid-cols-2 gap-2.5">
              {BACKGROUND_PRESETS.map((preset) => (
                <div
                  key={preset.name}
                  onClick={() => setBackgroundUrl(preset.url)}
                  className={`group relative h-20 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                    backgroundUrl === preset.url ? 'border-pink-500 ring-2 ring-pink-300' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img src={preset.url} alt={preset.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-black/30 flex items-end p-1.5">
                    <span className="text-[11px] font-medium text-white truncate drop-shadow">{preset.name}</span>
                  </div>
                  {backgroundUrl === preset.url && (
                    <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Custom URL */}
            <div className="mt-3">
              <span className="text-[11px] text-gray-500 block mb-1">또는 직접 이미지 URL 입력:</span>
              <div className="flex space-x-1.5">
                <input
                  type="text"
                  value={customBgInput}
                  onChange={(e) => setCustomBgInput(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-pink-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customBgInput.trim()) {
                      setBackgroundUrl(customBgInput.trim());
                      setCustomBgInput('');
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-gray-800 text-white text-xs font-semibold hover:bg-black"
                >
                  적용
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex items-center justify-end space-x-2 border-t border-gray-100 bg-gray-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 text-xs font-semibold"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold shadow-sm"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}