# 패들렛 클론 (Reverse Engineering Padlet) with Firebase & Netlify

대전둔산중학교의 패들렛 보드([Reverse Engineering](https://padlet.com/pad186_1/reverse-engineering-s0240zb8yagkkthefd97))를 역공학하여 만든 실시간 웹 애플리케이션입니다.

---

## 🚀 1. Netlify에 dist 배포하는 방법

### 방법 A: Netlify Drop (가장 간단 - 30초 완료)
1. [Netlify Drop](https://app.netlify.com/drop)에 접속하여 로그인합니다.
2. 현재 프로젝트의 **`dist` 폴더** 전체를 브라우저 화면의 점선 영역으로 **드래그 앤 드롭**합니다.
3. 수 초 내에 전 세계에 즉시 배포되어 나만의 패들렛 URL(`https://랜덤이름.netlify.app`)이 생성됩니다!

### 방법 B: Git 연동 (권장)
- GitHub에 프로젝트를 push하고 Netlify에서 가져오기:
  - **Build Command**: `npm run build`
  - **Publish directory**: `dist`

---

## 🔥 2. 파이어베이스(Firebase Firestore) DB 연동 방법

localStorage 대신 **Firebase Cloud Firestore**를 사용하여 모든 사용자가 실시간으로 카드를 보고, 작성하고, 이동할 수 있습니다.

### 단계 1: Firebase 프로젝트 및 Firestore 생성
1. [Firebase 콘솔](https://console.firebase.google.com/)에 접속하여 **프로젝트 추가**
2. 좌측 메뉴에서 **Firestore Database** ➔ **데이터베이스 만들기** 클릭
3. 보안 규칙 설정에서 **테스트 모드에서 시작** 선택 (또는 모든 사용자 읽기/쓰기 허용 규칙)
   ```text
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```
4. 좌측 상단 **프로젝트 설정 (톱니바퀴 ⚙️)** ➔ **일반** 탭 ➔ **내 앱**에서 **웹(`</>`)** 클릭 후 앱 등록
5. 화면에 나타나는 `firebaseConfig` 객체 복사:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project",
     storageBucket: "your-project.firebasestorage.app",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };
   ```

### 단계 2: 연결 설정 적용 (두 가지 방식 중 택1)

#### 방식 1) 웹 UI에서 바로 등록 (가장 간편!)
- 배포된 사이트(또는 로컬 `http://localhost:3000`)에 접속합니다.
- 상단 헤더 우측의 **`🔥 Firebase DB 연결`** 버튼을 클릭합니다.
- 복사한 `firebaseConfig` 전체 코드를 붙여넣기만 하면 자동으로 파싱되어 즉시 Firestore 실시간 통신이 시작됩니다!

#### 방식 2) Netlify 환경 변수에 등록
Netlify 사이트 대시보드 ➔ **Site configuration** ➔ **Environment variables** ➔ **Add a variable**에 다음 변수들을 등록 후 사이트를 재배포(`Retry deploy`)합니다:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

---

## ✨ 3. 기능 안내
- **실시간 동기화**: Firestore의 `onSnapshot` 리스너를 통해 다른 기기/브라우저에서 작성하거나 이동한 카드가 새로고침 없이 즉시 반영됩니다.
- **초기 데이터 자동 시딩**: 빈 데이터베이스에 처음 연결 시, 리버스 엔지니어링된 1반/2반/3반 및 "게시물 등록" 카드가 자동으로 등록됩니다.
- **카테고리(선반) 드래그 앤 드롭**: 컬럼 간 카드 이동 및 순서 제어
- **다양한 미디어 첨부**: 이미지 파일 업로드, 웹 이미지 URL, 외부 링크, 드로잉 캔버스 스케치
- **좋아요 & 댓글 실시간 반영**
- **패들렛 원본 배경화면 및 테마 설정**
