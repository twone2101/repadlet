export const INITIAL_BOARD = {
  id: "271201035",
  title: "Reverse Engineering",
  description: "패들렛 리버스 엔지니어링 보드",
  builder: {
    name: "대전둔산중학교",
    username: "pad186_1",
    avatar: "https://genai-public.padletcdn.com/disco/prod/imagen/1770117425695/sample_0.png",
  },
  background: {
    type: "image",
    url: "https://elvis.padletcdn.com/1/atat/e_in-u_1773398369/appbR1Qbe0DGnDKkS/tblhZFRy95OZHncLj/recz2nYoEtLTScVy8/fldJu5JvkUBo8MUFA",
    name: "따뜻한 나무와 가구 (원본 배경)"
  },
  layout: "shelf", // 선반(컬럼)형 레이아웃
  fontTheme: "default",
  requireApproval: false,
  filterProfanity: true,
  createdAt: "2026-09-29T06:47:01.611Z"
};

export const INITIAL_SECTIONS = [
  {
    id: "393745316",
    hashid: "sec_kZDR4LRrRg5dql9a",
    title: "1반",
    sort_index: 1
  },
  {
    id: "393745421",
    hashid: "sec_PkpnqAa8abdRqD0B",
    title: "2반",
    sort_index: 2
  },
  {
    id: "393745473",
    hashid: "sec_eo1R47bWbKnRvZDL",
    title: "3반",
    sort_index: 3
  }
];

export const INITIAL_POSTS = [
  {
    id: "4074176901",
    sectionId: "393745316", // 1반
    title: "게시물 등록",
    body: "리버스 엔지니어링을 통해 복제된 패들렛입니다. 자유롭게 게시물을 작성하고 카드를 드래그하여 이동시켜 보세요!",
    color: "#ffffff",
    author: {
      name: "대전둔산중학교",
      avatar: "https://genai-public.padletcdn.com/disco/prod/imagen/1770117425695/sample_0.png"
    },
    createdAt: "2026-09-29T06:47:58.684Z",
    likes: 3,
    userLiked: false,
    comments: [
      {
        id: "c_1",
        author: "익명 참가자",
        text: "패들렛의 컬럼형 보드(Shelf) 기능이 완벽하게 구현되었네요!",
        createdAt: "2026-10-19T10:15:00.000Z"
      }
    ],
    attachment: {
      type: "image",
      url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
      caption: "소프트웨어 리버스 엔지니어링 분석"
    }
  }
];

export const COLOR_PALETTE = [
  { name: "화이트", bg: "#ffffff", border: "#e5e7eb" },
  { name: "레드/핑크", bg: "#fee2e2", border: "#fca5a5" },
  { name: "오렌지", bg: "#ffedd5", border: "#fdba74" },
  { name: "옐로우", bg: "#fef9c3", border: "#fde047" },
  { name: "그린", bg: "#dcfce7", border: "#86efac" },
  { name: "블루", bg: "#e0f2fe", border: "#7dd3fc" },
  { name: "퍼플", bg: "#f3e8ff", border: "#d8b4fe" },
];

// 폰트 테마 프리셋 (원본 패들렛: Alps, Thames, Niagara, Pamir, Nile, Ganges)
export const FONT_PRESETS = [
  { id: 'default', name: '기본', fontFamily: "'Pretendard Variable', 'Noto Sans KR', system-ui, sans-serif", desc: '깔끔한 고딕체' },
  { id: 'serif', name: '세리프', fontFamily: "'Noto Serif KR', 'Georgia', serif", desc: '클래식한 명조체' },
  { id: 'rounded', name: '둥근체', fontFamily: "'IBM Plex Sans KR', 'Jua', system-ui, sans-serif", desc: '부드러운 둥근 고딕' },
  { id: 'handwrite', name: '손글씨', fontFamily: "'Nanum Pen Script', 'Gaegu', cursive", desc: '자연스러운 손글씨' },
  { id: 'mono', name: '코드', fontFamily: "'JetBrains Mono', 'Fira Code', monospace", desc: '개발자 스타일' },
  { id: 'cute', name: '귀여운', fontFamily: "'Jua', 'Gamja Flower', sans-serif", desc: '통통한 귀여운 폰트' },
];

// 비속어 필터 목록
export const PROFANITY_LIST = [
  '시발', '씨발', '개새끼', '병신', '지랄', '미친놈', '미친년',
  '꺼져', '닥쳐', 'fuck', 'shit', 'damn', 'bitch', 'ass',
  '씹', '좆', '엿먹어', '개같은', '쓰레기같은', '멍청이',
  '바보', '똥', '개쓰레기'
];

// 비속어 필터 함수
export function filterProfanity(text) {
  if (!text) return text;
  let filtered = text;
  for (const word of PROFANITY_LIST) {
    const regex = new RegExp(word, 'gi');
    filtered = filtered.replace(regex, '*'.repeat(word.length));
  }
  return filtered;
}

export const BACKGROUND_PRESETS = [
  {
    name: "따뜻한 원목 인테리어 (패들렛 원본)",
    url: "https://elvis.padletcdn.com/1/atat/e_in-u_1773398369/appbR1Qbe0DGnDKkS/tblhZFRy95OZHncLj/recz2nYoEtLTScVy8/fldJu5JvkUBo8MUFA"
  },
  {
    name: "빈티지 칠판",
    url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1920&auto=format&fit=crop&q=80"
  },
  {
    name: "모던 파스텔 그라디언트",
    url: "https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&auto=format&fit=crop&q=80"
  },
  {
    name: "조용한 서재 도서관",
    url: "https://images.unsplash.com/photo-1507842229452-e565785a2100?w=1920&auto=format&fit=crop&q=80"
  },
  {
    name: "푸른 바다 & 해변",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&auto=format&fit=crop&q=80"
  }
];
