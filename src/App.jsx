import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Column from './components/Column';
import PostModal from './components/PostModal';
import SettingsModal from './components/SettingsModal';
import ShareModal from './components/ShareModal';
import FirebaseModal from './components/FirebaseModal';
import AdminLoginModal from './components/AdminLoginModal';
import SlideshowModal from './components/SlideshowModal';
import PostDetailModal from './components/PostDetailModal';
import TeacherDashboard from './components/TeacherDashboard';
import EmptyBoardState from './components/EmptyBoardState';
import WallView from './components/WallView';
import StreamView from './components/StreamView';
import TableView from './components/TableView';
import { 
  INITIAL_BOARD, 
  INITIAL_SECTIONS, 
  INITIAL_POSTS,
  FONT_PRESETS
} from './data/initialData';
import { initFirebase } from './firebase/config';
import { 
  seedInitialDataIfEmpty,
  subscribeToBoards,
  subscribeToBoard,
  subscribeToSections,
  subscribeToPosts,
  createBoard as dbCreateBoard,
  updateBoard as dbUpdateBoard,
  deleteBoard as dbDeleteBoard,
  addSection,
  updateSectionTitle,
  deleteSection,
  savePost,
  updatePostSection,
  deletePost,
  togglePostLike,
  togglePostReaction,
  addCommentToPost,
  deleteCommentFromPost,
  resetFirestoreToInitial,
  DEFAULT_BOARD_ID,
  isDefaultBoardId
} from './firebase/db';
import { Plus, Flame, Sparkles, Lock, ArrowLeft } from 'lucide-react';

const LOCAL_STORAGE_BOARDS = 'padlet_boards_v2';
const LOCAL_STORAGE_SECTIONS = 'padlet_sections_v2';
const LOCAL_STORAGE_POSTS = 'padlet_posts_v2';

export default function App() {
  // Admin session state
  const [isAdmin, setIsAdmin] = useState(() => {
    return sessionStorage.getItem('padlet_is_admin') === 'true';
  });
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  // View mode: 'board' or 'dashboard'
  const [viewMode, setViewMode] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'dashboard') return 'dashboard';
    if (params.get('board')) return 'board';
    return sessionStorage.getItem('padlet_is_admin') === 'true' ? 'dashboard' : 'board';
  });

  // Current active board ID
  const [currentBoardId, setCurrentBoardId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('board') || DEFAULT_BOARD_ID;
  });

  // All boards list
  const [boards, setBoards] = useState(() => {
    const local = localStorage.getItem(LOCAL_STORAGE_BOARDS);
    if (local) {
      try { return JSON.parse(local); } catch (e) {}
    }
    return [{ ...INITIAL_BOARD, id: DEFAULT_BOARD_ID }];
  });

  // Active board object: Ensure fallback NEVER incorrectly latches onto other classroom boards
  const isCurrentDefault = isDefaultBoardId(currentBoardId);
  const activeBoard = isCurrentDefault
    ? (boards.find(b => isDefaultBoardId(b.id)) || { ...INITIAL_BOARD, id: DEFAULT_BOARD_ID })
    : (boards.find(b => String(b.id) === String(currentBoardId)) || boards.find(b => isDefaultBoardId(b.id)) || { ...INITIAL_BOARD, id: DEFAULT_BOARD_ID });

  // Sections & Posts for active board
  const [sections, setSections] = useState(() => {
    const local = localStorage.getItem(LOCAL_STORAGE_SECTIONS);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        return parsed.filter(s => isCurrentDefault ? isDefaultBoardId(s.boardId) : String(s.boardId) === String(currentBoardId));
      } catch (e) {}
    }
    return INITIAL_SECTIONS.map(s => ({ ...s, boardId: DEFAULT_BOARD_ID }));
  });

  const [posts, setPosts] = useState(() => {
    const local = localStorage.getItem(LOCAL_STORAGE_POSTS);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        return parsed.filter(p => isCurrentDefault ? isDefaultBoardId(p.boardId) : String(p.boardId) === String(currentBoardId));
      } catch (e) {}
    }
    return INITIAL_POSTS.map(p => ({ ...p, boardId: DEFAULT_BOARD_ID }));
  });

  // Firebase status
  const [firebaseStatus, setFirebaseStatus] = useState({
    isConnected: false,
    config: null,
    db: null
  });

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isFirebaseOpen, setIsFirebaseOpen] = useState(false);
  const [isSlideshowOpen, setIsSlideshowOpen] = useState(false);
  const [detailPostId, setDetailPostId] = useState(null);
  const [layout, setLayout] = useState(activeBoard.layout || 'shelf');

  // New Section Inline Input
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');

  const dbRef = useRef(null);

  // Sync layout when activeBoard changes
  useEffect(() => {
    if (activeBoard.layout && activeBoard.layout !== layout) {
      setLayout(activeBoard.layout);
    }
  }, [activeBoard.layout, activeBoard.id]);

  // Handle URL change & Browser History Popstate
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const bId = params.get('board');
      const v = params.get('view');

      if (v === 'dashboard') {
        setViewMode('dashboard');
      } else if (bId) {
        setCurrentBoardId(bId);
        setViewMode('board');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update URL query when board or viewMode changes
  const updateUrl = (mode, boardId) => {
    const url = new URL(window.location.href);
    if (mode === 'dashboard') {
      url.searchParams.set('view', 'dashboard');
      url.searchParams.delete('board');
    } else {
      url.searchParams.delete('view');
      url.searchParams.set('board', boardId);
    }
    window.history.pushState({}, '', url.toString());
  };

  const handleSelectBoard = (boardId) => {
    setCurrentBoardId(boardId);
    setViewMode('board');
    updateUrl('board', boardId);
  };

  const handleGoDashboard = () => {
    if (!isAdmin) {
      setIsAdminLoginOpen(true);
      return;
    }
    setViewMode('dashboard');
    updateUrl('dashboard');
  };

  // Firebase Setup & Real-time Listeners
  const setupFirebase = () => {
    const { db, config } = initFirebase();
    if (db && config) {
      dbRef.current = db;
      setFirebaseStatus({ isConnected: true, config, db });

      // Seed if brand new
      seedInitialDataIfEmpty(db, INITIAL_BOARD, INITIAL_SECTIONS, INITIAL_POSTS);

      // 1. Subscribe to all boards
      const unsubBoards = subscribeToBoards(db, (boardsData) => {
        if (boardsData) {
          setBoards(boardsData);
        }
      });

      // 2. Subscribe to current active board sections
      const unsubSections = subscribeToSections(db, currentBoardId, (sectionsData) => {
        if (sectionsData) setSections(sectionsData);
      });

      // 3. Subscribe to current active board posts
      const unsubPosts = subscribeToPosts(db, currentBoardId, (postsData) => {
        if (postsData) setPosts(postsData);
      });

      return () => {
        unsubBoards();
        unsubSections();
        unsubPosts();
      };
    } else {
      dbRef.current = null;
      setFirebaseStatus({ isConnected: false, config: null, db: null });
    }
  };

  useEffect(() => {
    const cleanup = setupFirebase();
    return () => {
      if (cleanup) cleanup();
    };
  }, [currentBoardId]);

  // Sync to LocalStorage fallback if Firebase is not active
  useEffect(() => {
    if (!dbRef.current) {
      localStorage.setItem(LOCAL_STORAGE_BOARDS, JSON.stringify(boards));
    }
  }, [boards]);

  // Admin login / logout
  const handleAdminLoginSuccess = () => {
    sessionStorage.setItem('padlet_is_admin', 'true');
    setIsAdmin(true);
    setViewMode('dashboard');
    updateUrl('dashboard');
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('padlet_is_admin');
    setIsAdmin(false);
    setViewMode('board');
    updateUrl('board', currentBoardId);
  };

  // Board CRUD handlers
  const handleCreateBoard = async (newBoardData, initialSections = []) => {
    if (dbRef.current) {
      await dbCreateBoard(dbRef.current, newBoardData, initialSections);
    } else {
      const updatedBoards = [newBoardData, ...boards];
      setBoards(updatedBoards);
      
      const allSections = JSON.parse(localStorage.getItem(LOCAL_STORAGE_SECTIONS) || '[]');
      const mergedSections = [...allSections, ...initialSections];
      localStorage.setItem(LOCAL_STORAGE_SECTIONS, JSON.stringify(mergedSections));
      
      setSections(initialSections);
      setPosts([]);
    }

    // Switch to newly created board
    handleSelectBoard(newBoardData.id);
  };

  const handleUpdateBoard = async (boardId, updatedData) => {
    const targetId = boardId || activeBoard.id;
    if (dbRef.current) {
      await dbUpdateBoard(dbRef.current, targetId, updatedData);
    } else {
      const updated = boards.map(b => String(b.id) === String(targetId) ? { ...b, ...updatedData } : b);
      setBoards(updated);
    }
  };

  const handleDeleteBoard = async (boardId) => {
    if (dbRef.current) {
      await dbDeleteBoard(dbRef.current, boardId);
    } else {
      const remainingBoards = boards.filter(b => String(b.id) !== String(boardId));
      setBoards(remainingBoards);
      
      // Clean local storage sections & posts
      const allSections = JSON.parse(localStorage.getItem(LOCAL_STORAGE_SECTIONS) || '[]');
      const filteredSec = allSections.filter(s => String(s.boardId) !== String(boardId));
      localStorage.setItem(LOCAL_STORAGE_SECTIONS, JSON.stringify(filteredSec));

      const allPosts = JSON.parse(localStorage.getItem(LOCAL_STORAGE_POSTS) || '[]');
      const filteredPosts = allPosts.filter(p => String(p.boardId) !== String(boardId));
      localStorage.setItem(LOCAL_STORAGE_POSTS, JSON.stringify(filteredPosts));

      if (String(currentBoardId) === String(boardId) && remainingBoards.length > 0) {
        setCurrentBoardId(remainingBoards[0].id);
      }
    }
  };

  // Sections Handlers
  const handleAddSection = async (e) => {
    e?.preventDefault();
    if (!isAdmin) {
      alert('섹션 추가는 관리자만 가능합니다.');
      return;
    }
    if (!newSectionTitle.trim()) return;

    const newSection = {
      id: 'sec_' + Date.now(),
      hashid: 'sec_' + Math.random().toString(36).substring(2, 9),
      title: newSectionTitle.trim(),
      sort_index: sections.length + 1,
      boardId: String(activeBoard.id)
    };

    if (dbRef.current) {
      await addSection(dbRef.current, newSection);
    } else {
      const nextSections = [...sections, newSection];
      setSections(nextSections);
      const allSections = JSON.parse(localStorage.getItem(LOCAL_STORAGE_SECTIONS) || '[]');
      localStorage.setItem(LOCAL_STORAGE_SECTIONS, JSON.stringify([...allSections, newSection]));
    }

    setNewSectionTitle('');
    setIsAddingSection(false);
  };

  const handleUpdateSectionTitle = async (sectionId, newTitle) => {
    if (!isAdmin) {
      alert('섹션 수정은 관리자만 가능합니다.');
      return;
    }
    if (dbRef.current) {
      await updateSectionTitle(dbRef.current, sectionId, newTitle);
    } else {
      setSections(sections.map(s => s.id === sectionId ? { ...s, title: newTitle } : s));
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!isAdmin) {
      alert('섹션 삭제는 관리자만 가능합니다.');
      return;
    }
    if (window.confirm('이 섹션과 포함된 모든 게시물을 삭제하시겠습니까?')) {
      if (dbRef.current) {
        await deleteSection(dbRef.current, sectionId);
      } else {
        setSections(sections.filter(s => s.id !== sectionId));
        setPosts(posts.filter(p => p.sectionId !== sectionId));
      }
    }
  };

  // Posts Handlers
  const handleOpenAddPost = (sectionId) => {
    if (activeBoard.isLocked && !isAdmin) {
      alert('현재 선생님께서 이 보드의 글쓰기를 잠가두었습니다 (읽기 전용).');
      return;
    }
    setEditingPost(null);
    setSelectedSectionId(sectionId || sections[0]?.id || '');
    setIsPostModalOpen(true);
  };

  const handleOpenEditPost = (post) => {
    if (!isAdmin) {
      alert('게시물 수정은 관리자만 가능합니다.');
      return;
    }
    setEditingPost(post);
    setSelectedSectionId(post.sectionId);
    setIsPostModalOpen(true);
  };

  const handleSavePost = async (savedPost) => {
    const postWithBoard = {
      ...savedPost,
      boardId: String(activeBoard.id)
    };

    if (dbRef.current) {
      await savePost(dbRef.current, postWithBoard);
    } else {
      let updatedPosts;
      if (editingPost) {
        updatedPosts = posts.map(p => p.id === postWithBoard.id ? postWithBoard : p);
      } else {
        updatedPosts = [postWithBoard, ...posts];
      }
      setPosts(updatedPosts);
      
      const allPosts = JSON.parse(localStorage.getItem(LOCAL_STORAGE_POSTS) || '[]');
      const filteredOther = allPosts.filter(p => p.id !== postWithBoard.id);
      localStorage.setItem(LOCAL_STORAGE_POSTS, JSON.stringify([postWithBoard, ...filteredOther]));
    }
  };

  const handleDeletePost = async (postId) => {
    if (!isAdmin) {
      alert('게시물 삭제는 관리자만 가능합니다.');
      return;
    }
    if (window.confirm('이 게시물을 삭제하시겠습니까?')) {
      if (dbRef.current) {
        await deletePost(dbRef.current, postId);
      } else {
        setPosts(posts.filter(p => p.id !== postId));
        const allPosts = JSON.parse(localStorage.getItem(LOCAL_STORAGE_POSTS) || '[]');
        localStorage.setItem(LOCAL_STORAGE_POSTS, JSON.stringify(allPosts.filter(p => p.id !== postId)));
      }
    }
  };

  const handleMovePost = async (postId, newSectionId) => {
    if (!isAdmin) return;
    if (dbRef.current) {
      await updatePostSection(dbRef.current, postId, newSectionId);
    } else {
      setPosts(posts.map(p => p.id === postId ? { ...p, sectionId: newSectionId } : p));
    }
  };

  const handleToggleLike = async (post) => {
    if (dbRef.current) {
      await togglePostLike(dbRef.current, post);
    } else {
      const nextLiked = !post.userLiked;
      const nextCount = nextLiked ? (post.likes || 0) + 1 : Math.max(0, (post.likes || 1) - 1);
      setPosts(posts.map(p => p.id === post.id ? { ...p, likes: nextCount, userLiked: nextLiked } : p));
    }
  };

  const handleToggleReaction = async (post, emoji) => {
    if (dbRef.current) {
      await togglePostReaction(dbRef.current, post, emoji);
    } else {
      const reactions = { ...(post.reactions || {}) };
      const userReactions = [...(post.userReactions || [])];
      const has = userReactions.includes(emoji);
      const nextUserReactions = has ? userReactions.filter(e => e !== emoji) : [...userReactions, emoji];
      const nextCount = has ? Math.max(0, (reactions[emoji] || 1) - 1) : (reactions[emoji] || 0) + 1;
      
      if (nextCount <= 0) delete reactions[emoji];
      else reactions[emoji] = nextCount;

      const totalLikes = Object.values(reactions).reduce((sum, val) => sum + val, 0);

      setPosts(posts.map(p => p.id === post.id ? {
        ...p,
        reactions,
        userReactions: nextUserReactions,
        likes: totalLikes,
        userLiked: nextUserReactions.length > 0
      } : p));
    }
  };

  const handleAddComment = async (postId, commentText) => {
    if (!commentText.trim()) return;
    const targetPost = posts.find(p => p.id === postId);
    if (!targetPost) return;

    const newComment = {
      id: 'c_' + Date.now(),
      author: isAdmin ? '선생님' : '학생',
      text: commentText.trim(),
      createdAt: new Date().toISOString()
    };

    if (dbRef.current) {
      await addCommentToPost(dbRef.current, postId, targetPost.comments, newComment);
    } else {
      const updatedComments = [...(targetPost.comments || []), newComment];
      setPosts(posts.map(p => p.id === postId ? { ...p, comments: updatedComments } : p));
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!isAdmin) {
      alert('댓글 삭제는 관리자만 가능합니다.');
      return;
    }
    const targetPost = posts.find(p => p.id === postId);
    if (!targetPost) return;

    if (dbRef.current) {
      await deleteCommentFromPost(dbRef.current, postId, targetPost.comments, commentId);
    } else {
      const updatedComments = (targetPost.comments || []).filter(c => c.id !== commentId);
      setPosts(posts.map(p => p.id === postId ? { ...p, comments: updatedComments } : p));
    }
  };

  const handleTogglePin = async (postId) => {
    if (!isAdmin) return;
    const targetPost = posts.find(p => p.id === postId);
    if (!targetPost) return;
    const nextPinned = !targetPost.isPinned;
    await handleSavePost({ ...targetPost, isPinned: nextPinned });
  };

  const handleApprovePost = async (postId) => {
    if (!isAdmin) return;
    const targetPost = posts.find(p => p.id === postId);
    if (!targetPost) return;
    await handleSavePost({ ...targetPost, isApproved: true });
  };

  const handleResetData = async () => {
    if (!isAdmin) return;
    if (window.confirm('정말 현재 보드를 초기 기본 예시 상태로 리셋하시겠습니까?')) {
      if (dbRef.current) {
        await resetFirestoreToInitial(dbRef.current, INITIAL_BOARD, INITIAL_SECTIONS, INITIAL_POSTS);
      } else {
        localStorage.removeItem(LOCAL_STORAGE_BOARDS);
        localStorage.removeItem(LOCAL_STORAGE_SECTIONS);
        localStorage.removeItem(LOCAL_STORAGE_POSTS);
        setBoards([{ ...INITIAL_BOARD, id: DEFAULT_BOARD_ID }]);
        setSections(INITIAL_SECTIONS.map(s => ({ ...s, boardId: DEFAULT_BOARD_ID })));
        setPosts(INITIAL_POSTS.map(p => ({ ...p, boardId: DEFAULT_BOARD_ID })));
      }
    }
  };

  // Filter posts based on search query
  const filteredPosts = posts.filter(post => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const titleMatch = post.title?.toLowerCase().includes(q);
    const bodyMatch = post.body?.toLowerCase().includes(q);
    const authorMatch = post.author?.name?.toLowerCase().includes(q);
    return titleMatch || bodyMatch || authorMatch;
  });

  const detailPost = posts.find(p => p.id === detailPostId);
  const detailSection = sections.find(s => s.id === detailPost?.sectionId);

  // Background style
  const backgroundStyle = activeBoard.background?.type === 'color' 
    ? { backgroundColor: activeBoard.background.value }
    : { 
        backgroundImage: `url(${activeBoard.background?.url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      };

  const activeFontTheme = FONT_PRESETS.find(f => f.id === activeBoard.fontTheme) || FONT_PRESETS[0];

  // 1. If Teacher Dashboard view mode, or if Teacher is logged in and no boards exist yet
  if (viewMode === 'dashboard' || (isAdmin && boards.length === 0)) {
    return (
      <>
        <TeacherDashboard
          boards={boards}
          sections={sections}
          posts={posts}
          onSelectBoard={handleSelectBoard}
          onCreateBoard={handleCreateBoard}
          onUpdateBoard={handleUpdateBoard}
          onDeleteBoard={handleDeleteBoard}
          onLogout={handleAdminLogout}
          onOpenFirebase={() => setIsFirebaseOpen(true)}
          firebaseStatus={firebaseStatus}
        />
        <FirebaseModal
          isOpen={isFirebaseOpen}
          onClose={() => setIsFirebaseOpen(false)}
          firebaseStatus={firebaseStatus}
          onConfigUpdated={setupFirebase}
        />
      </>
    );
  }

  // 2. If student/visitor and no boards exist at all in the school
  if (!isAdmin && boards.length === 0) {
    return (
      <>
        <EmptyBoardState
          onOpenLogin={() => setIsAdminLoginOpen(true)}
          onOpenFirebase={() => setIsFirebaseOpen(true)}
          firebaseStatus={firebaseStatus}
        />
        <AdminLoginModal
          isOpen={isAdminLoginOpen}
          onClose={() => setIsAdminLoginOpen(false)}
          onLoginSuccess={handleAdminLoginSuccess}
        />
        <FirebaseModal
          isOpen={isFirebaseOpen}
          onClose={() => setIsFirebaseOpen(false)}
          firebaseStatus={firebaseStatus}
          onConfigUpdated={setupFirebase}
        />
      </>
    );
  }

  // 3. If student/visitor accessed a specific board URL that does not exist or was deleted
  const isTargetBoardMissing = !isCurrentDefault && !boards.some(b => String(b.id) === String(currentBoardId));
  if (!isAdmin && isTargetBoardMissing) {
    return (
      <>
        <EmptyBoardState
          boardNotFound={true}
          onOpenLogin={() => setIsAdminLoginOpen(true)}
          onOpenFirebase={() => setIsFirebaseOpen(true)}
          firebaseStatus={firebaseStatus}
        />
        <AdminLoginModal
          isOpen={isAdminLoginOpen}
          onClose={() => setIsAdminLoginOpen(false)}
          onLoginSuccess={handleAdminLoginSuccess}
        />
        <FirebaseModal
          isOpen={isFirebaseOpen}
          onClose={() => setIsFirebaseOpen(false)}
          firebaseStatus={firebaseStatus}
          onConfigUpdated={setupFirebase}
        />
      </>
    );
  }

  // 4. Otherwise, render Board view (Student & Teacher view of a specific board)
  return (
    <div 
      className="h-screen w-screen flex flex-col overflow-hidden antialiased selection:bg-pink-300 selection:text-pink-900"
      style={{
        ...backgroundStyle,
        fontFamily: activeFontTheme.fontFamily
      }}
    >
      {/* Top Header */}
      <Header
        board={activeBoard}
        currentLayout={layout}
        onChangeLayout={(newLayout) => {
          setLayout(newLayout);
          handleUpdateBoard(activeBoard.id, { layout: newLayout });
        }}
        onUpdateTitle={(newTitle) => handleUpdateBoard(activeBoard.id, { title: newTitle })}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenShare={() => setIsShareOpen(true)}
        onOpenSlideshow={() => setIsSlideshowOpen(true)}
        onOpenFirebase={() => setIsFirebaseOpen(true)}
        firebaseStatus={firebaseStatus}
        onResetData={handleResetData}
        onAddSection={() => setIsAddingSection(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isAdmin={isAdmin}
        onOpenLogin={() => setIsAdminLoginOpen(true)}
        onLogout={handleAdminLogout}
        onGoDashboard={handleGoDashboard}
      />

      {/* Locked Notice Banner */}
      {activeBoard.isLocked && (
        <div className="bg-amber-500 text-white px-4 py-2 text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 shadow-md animate-fadeIn z-20 flex-shrink-0">
          <Lock className="w-4 h-4" />
          <span>수업 종료로 현재 글쓰기가 잠겨 있습니다. (게시글 열람만 가능합니다)</span>
          {isAdmin && (
            <button
              onClick={() => handleUpdateBoard(activeBoard.id, { isLocked: false })}
              className="ml-2 px-2 py-0.5 rounded bg-black/20 hover:bg-black/30 text-xs font-semibold underline"
            >
              잠금 해제하기
            </button>
          )}
        </div>
      )}

      {/* 1. Shelf (Kanban Columns) */}
      {layout === 'shelf' && (
        <main className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden p-6 flex items-start space-x-6 z-10">
          {sections.map((section) => {
            const sectionPosts = filteredPosts.filter(p => p.sectionId === section.id);
            return (
              <Column
                key={section.id}
                section={section}
                posts={sectionPosts}
                onAddPost={handleOpenAddPost}
                onEditPost={handleOpenEditPost}
                onDeletePost={handleDeletePost}
                onMovePost={handleMovePost}
                onUpdateTitle={handleUpdateSectionTitle}
                onDeleteSection={handleDeleteSection}
                onToggleLike={handleToggleLike}
                onToggleReaction={handleToggleReaction}
                onOpenDetail={(post) => setDetailPostId(post.id)}
                onAddComment={handleAddComment}
                onDeleteComment={handleDeleteComment}
                onTogglePin={handleTogglePin}
                onApprove={handleApprovePost}
                isAdmin={isAdmin}
              />
            );
          })}

          {/* Add Section Inline Form for Admin */}
          {isAdmin && (
            <div className="flex-shrink-0 w-80">
              {isAddingSection ? (
                <form 
                  onSubmit={handleAddSection}
                  className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-pink-300 animate-fadeIn"
                >
                  <input
                    type="text"
                    value={newSectionTitle}
                    onChange={(e) => setNewSectionTitle(e.target.value)}
                    placeholder="섹션 이름 입력... (예: 4모둠)"
                    className="w-full text-sm font-bold px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 mb-3"
                    autoFocus
                  />
                  <div className="flex items-center space-x-2">
                    <button
                      type="submit"
                      className="flex-1 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold transition-colors"
                    >
                      추가
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingSection(false)}
                      className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold transition-colors"
                    >
                      취소
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setIsAddingSection(true)}
                  className="w-full py-3.5 px-4 rounded-2xl bg-white/40 hover:bg-white/70 backdrop-blur-md border border-white/60 hover:border-pink-300 text-gray-800 font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-sm group"
                >
                  <Plus className="w-5 h-5 text-gray-600 group-hover:text-pink-600 transition-colors" />
                  <span>섹션 추가</span>
                </button>
              )}
            </div>
          )}
        </main>
      )}

      {/* 2. Wall / Grid */}
      {layout === 'grid' && (
        <WallView
          posts={filteredPosts}
          sections={sections}
          onAddPost={handleOpenAddPost}
          onEditPost={handleOpenEditPost}
          onDeletePost={handleDeletePost}
          onToggleLike={handleToggleLike}
          onToggleReaction={handleToggleReaction}
          onOpenDetail={(post) => setDetailPostId(post.id)}
          onAddComment={handleAddComment}
          onDeleteComment={handleDeleteComment}
          onTogglePin={handleTogglePin}
          onApprove={handleApprovePost}
          isAdmin={isAdmin}
        />
      )}

      {/* 3. Stream */}
      {layout === 'stream' && (
        <StreamView
          posts={filteredPosts}
          sections={sections}
          onAddPost={handleOpenAddPost}
          onEditPost={handleOpenEditPost}
          onDeletePost={handleDeletePost}
          onToggleLike={handleToggleLike}
          onToggleReaction={handleToggleReaction}
          onOpenDetail={(post) => setDetailPostId(post.id)}
          onAddComment={handleAddComment}
          onDeleteComment={handleDeleteComment}
          onTogglePin={handleTogglePin}
          onApprove={handleApprovePost}
          isAdmin={isAdmin}
        />
      )}

      {/* 4. Table */}
      {layout === 'table' && (
        <TableView
          posts={filteredPosts}
          sections={sections}
          onAddPost={handleOpenAddPost}
          onEditPost={handleOpenEditPost}
          onDeletePost={handleDeletePost}
          onOpenDetail={(post) => setDetailPostId(post.id)}
          onTogglePin={handleTogglePin}
          onApprove={handleApprovePost}
          isAdmin={isAdmin}
        />
      )}

      {/* Floating Action Button (작성 잠금일 경우 학생에게는 비활성화/숨김) */}
      {(!activeBoard.isLocked || isAdmin) && (
        <button
          onClick={() => handleOpenAddPost(sections[0]?.id)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-pink-500 hover:bg-pink-600 active:bg-pink-700 text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all z-20"
          title="빠른 게시물 추가"
        >
          <Plus className="w-7 h-7" />
        </button>
      )}

      {/* Modals */}
      <PostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onSave={handleSavePost}
        editingPost={editingPost}
        sectionId={selectedSectionId}
        sections={sections}
        board={activeBoard}
        isAdmin={isAdmin}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        board={activeBoard}
        onUpdateBoard={(data) => handleUpdateBoard(activeBoard.id, data)}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        board={activeBoard}
      />

      <FirebaseModal
        isOpen={isFirebaseOpen}
        onClose={() => setIsFirebaseOpen(false)}
        firebaseStatus={firebaseStatus}
        onConfigUpdated={setupFirebase}
      />

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {isSlideshowOpen && (
        <SlideshowModal
          isOpen={isSlideshowOpen}
          onClose={() => setIsSlideshowOpen(false)}
          board={activeBoard}
          sections={sections}
          posts={posts}
        />
      )}

      <PostDetailModal
        isOpen={!!detailPost}
        onClose={() => setDetailPostId(null)}
        post={detailPost}
        sectionTitle={detailSection?.title}
        allPosts={posts}
        onSelectPost={(p) => setDetailPostId(p?.id || null)}
        onEditPost={handleOpenEditPost}
        onDeletePost={handleDeletePost}
        onToggleReaction={handleToggleReaction}
        onAddComment={handleAddComment}
        onDeleteComment={handleDeleteComment}
        onTogglePin={handleTogglePin}
        onApprove={handleApprovePost}
        isAdmin={isAdmin}
      />
    </div>
  );
}
