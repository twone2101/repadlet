import React, { useState } from 'react';
import { X, Flame, CheckCircle2, AlertCircle, ExternalLink, RefreshCw, KeyRound, Copy } from 'lucide-react';
import { saveUserFirebaseConfig, removeUserFirebaseConfig } from '../firebase/config';

export default function FirebaseModal({ 
  isOpen, 
  onClose, 
  firebaseStatus, 
  onConfigUpdated 
}) {
  if (!isOpen) return null;

  const [rawConfigText, setRawConfigText] = useState('');
  const [apiKey, setApiKey] = useState(firebaseStatus.config?.apiKey || '');
  const [authDomain, setAuthDomain] = useState(firebaseStatus.config?.authDomain || '');
  const [projectId, setProjectId] = useState(firebaseStatus.config?.projectId || '');
  const [storageBucket, setStorageBucket] = useState(firebaseStatus.config?.storageBucket || '');
  const [messagingSenderId, setMessagingSenderId] = useState(firebaseStatus.config?.messagingSenderId || '');
  const [appId, setAppId] = useState(firebaseStatus.config?.appId || '');
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-parse when user pastes the whole firebaseConfig object
  const handleParseRawText = (text) => {
    setRawConfigText(text);
    setErrorMsg('');
    try {
      // Extract apiKey, projectId, etc. using regex
      const apiKeyMatch = text.match(/apiKey:\s*["']([^"']+)["']/);
      const authDomainMatch = text.match(/authDomain:\s*["']([^"']+)["']/);
      const projectIdMatch = text.match(/projectId:\s*["']([^"']+)["']/);
      const storageBucketMatch = text.match(/storageBucket:\s*["']([^"']+)["']/);
      const messagingSenderIdMatch = text.match(/messagingSenderId:\s*["']([^"']+)["']/);
      const appIdMatch = text.match(/appId:\s*["']([^"']+)["']/);

      if (apiKeyMatch) setApiKey(apiKeyMatch[1]);
      if (authDomainMatch) setAuthDomain(authDomainMatch[1]);
      if (projectIdMatch) setProjectId(projectIdMatch[1]);
      if (storageBucketMatch) setStorageBucket(storageBucketMatch[1]);
      if (messagingSenderIdMatch) setMessagingSenderId(messagingSenderIdMatch[1]);
      if (appIdMatch) setAppId(appIdMatch[1]);
    } catch {
      // ignore
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!apiKey.trim() || !projectId.trim()) {
      setErrorMsg('API Key와 Project ID는 필수 항목입니다.');
      return;
    }

    const config = {
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim(),
      projectId: projectId.trim(),
      storageBucket: storageBucket.trim(),
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim()
    };

    saveUserFirebaseConfig(config);
    onConfigUpdated();
    onClose();
  };

  const handleDisconnect = () => {
    if (window.confirm('저장된 Firebase 설정을 삭제하시겠습니까?')) {
      removeUserFirebaseConfig();
      onConfigUpdated();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-amber-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Flame className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 leading-tight">Firebase Firestore DB 연동</h2>
              <p className="text-[11px] text-gray-500">실시간 데이터베이스 동기화 설정</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-black/5 text-gray-400 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-gray-700">
          {/* Status Banner */}
          <div className={`p-3.5 rounded-2xl flex items-start space-x-3 border ${
            firebaseStatus.isConnected 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            {firebaseStatus.isConnected ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="font-bold text-sm">
                {firebaseStatus.isConnected 
                  ? `Firebase DB 연결됨 (${firebaseStatus.config?.projectId})` 
                  : 'Firebase DB 미연결 (설정 필요)'}
              </p>
              <p className="text-[11px] mt-0.5 opacity-90">
                {firebaseStatus.isConnected 
                  ? `연결 소스: ${firebaseStatus.config?.source === 'env' ? '환경 변수(.env / Netlify Env)' : '웹 브라우저 설정'}. 모든 게시물과 섹션이 실시간 동기화됩니다.` 
                  : '아래에 Firebase 설정을 입력하시면 실시간 Firestore DB와 연동됩니다.'}
              </p>
            </div>
          </div>

          {/* Quick Guide */}
          <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100 space-y-1.5 text-[11px] text-gray-600">
            <span className="font-bold text-gray-800 flex items-center space-x-1">
              <span>💡 Firebase 설정 가이드 (1분 소요):</span>
            </span>
            <ol className="list-decimal list-inside space-y-1 pl-1">
              <li>
                <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-blue-600 underline font-medium">
                  Firebase 콘솔 ↗
                </a> 접속 후 프로젝트 생성
              </li>
              <li>좌측 메뉴 <strong>Firestore Database</strong> 클릭 ➔ <strong>데이터베이스 만들기</strong> (테스트 모드 선택)</li>
              <li><strong>프로젝트 설정 ⚙️ ➔ 일반 ➔ 내 앱 ➔ 웹(&lt;/&gt;) 등록</strong> 후 나타나는 <code className="bg-gray-200 px-1 rounded">firebaseConfig</code> 코드 복사</li>
              <li>아래 전체 붙여넣기 창에 붙여넣으면 자동으로 필드가 채워집니다.</li>
            </ol>
          </div>

          {/* Paste Whole Config */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              firebaseConfig 코드 전체 붙여넣기 (자동 파싱):
            </label>
            <textarea
              value={rawConfigText}
              onChange={(e) => handleParseRawText(e.target.value)}
              placeholder="const firebaseConfig = { apiKey: '...', projectId: '...', ... };"
              rows={3}
              className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono text-[11px]"
            />
          </div>

          {/* Manual Form Inputs */}
          <div className="space-y-3 pt-1 border-t border-gray-100">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">API Key *</label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3 py-1.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Project ID *</label>
                <input
                  type="text"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  placeholder="my-padlet-project"
                  className="w-full px-3 py-1.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Auth Domain</label>
                <input
                  type="text"
                  value={authDomain}
                  onChange={(e) => setAuthDomain(e.target.value)}
                  placeholder="my-project.firebaseapp.com"
                  className="w-full px-3 py-1.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Storage Bucket</label>
                <input
                  type="text"
                  value={storageBucket}
                  onChange={(e) => setStorageBucket(e.target.value)}
                  placeholder="my-project.appspot.com"
                  className="w-full px-3 py-1.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">App ID</label>
                <input
                  type="text"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  placeholder="1:123456:web:abcd"
                  className="w-full px-3 py-1.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {errorMsg && (
            <p className="text-red-500 font-semibold">{errorMsg}</p>
          )}

          {/* Netlify Env Tip */}
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-900 text-[11px]">
            <strong>🚀 Netlify 환경 변수 연동 팁:</strong> Netlify 사이트 대시보드 ➔ <strong>Site configuration</strong> ➔ <strong>Environment variables</strong>에 <code className="bg-blue-100 px-1 rounded">VITE_FIREBASE_API_KEY</code>, <code className="bg-blue-100 px-1 rounded">VITE_FIREBASE_PROJECT_ID</code> 등을 등록하시면 별도 입력 없이 전 세계 어디서든 자동 연결됩니다!
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100 bg-gray-50/50">
          {firebaseStatus.config?.source === 'ui' ? (
            <button
              type="button"
              onClick={handleDisconnect}
              className="text-red-600 hover:text-red-700 font-semibold text-xs"
            >
              설정 삭제 (초기화)
            </button>
          ) : <div />}

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 text-xs font-semibold"
            >
              닫기
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm"
            >
              연결 및 저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
