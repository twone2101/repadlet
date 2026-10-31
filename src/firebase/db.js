import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where,
  orderBy
} from 'firebase/firestore';

export const DEFAULT_BOARD_ID = '271201035';

/**
 * Check if the database already has data; if not, seed initial board data.
 */
export async function seedInitialDataIfEmpty(db, initialBoard, initialSections, initialPosts) {
  try {
    const boardRef = doc(db, 'boards', String(initialBoard.id || DEFAULT_BOARD_ID));
    const boardSnap = await getDoc(boardRef);

    if (!boardSnap.exists()) {
      console.log('Seeding initial board data to Firestore...');
      // 1. Seed default board
      await setDoc(boardRef, {
        ...initialBoard,
        id: String(initialBoard.id || DEFAULT_BOARD_ID),
        isLocked: false,
        updatedAt: new Date().toISOString()
      });

      // 2. Seed sections with boardId
      for (const section of initialSections) {
        const secRef = doc(db, 'sections', String(section.id));
        await setDoc(secRef, {
          ...section,
          boardId: String(initialBoard.id || DEFAULT_BOARD_ID),
          updatedAt: new Date().toISOString()
        });
      }

      // 3. Seed posts with boardId
      for (const post of initialPosts) {
        const postRef = doc(db, 'posts', String(post.id));
        await setDoc(postRef, {
          ...post,
          boardId: String(initialBoard.id || DEFAULT_BOARD_ID),
          updatedAt: new Date().toISOString()
        });
      }

      console.log('Firebase seeding complete!');
    }
  } catch (err) {
    console.error('Error seeding initial Firestore data:', err);
  }
}

/**
 * Subscribe to all Boards (for Teacher Dashboard)
 */
export function subscribeToBoards(db, callback) {
  const boardsCol = collection(db, 'boards');
  return onSnapshot(boardsCol, (snapshot) => {
    const boards = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
    callback(boards);
  }, (error) => {
    console.error('Boards subscription error:', error);
  });
}

/**
 * Subscribe to a specific Board in real time
 */
export function subscribeToBoard(db, boardId, callback) {
  const targetId = String(boardId || DEFAULT_BOARD_ID);
  const boardRef = doc(db, 'boards', targetId);
  return onSnapshot(boardRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() });
    } else {
      callback(null);
    }
  }, (error) => {
    console.error(`Board [${targetId}] subscription error:`, error);
  });
}

/**
 * Subscribe to Sections for a specific board in real time
 */
export function subscribeToSections(db, boardId, callback) {
  const targetId = String(boardId || DEFAULT_BOARD_ID);
  const q = query(collection(db, 'sections'), orderBy('sort_index', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const sections = snapshot.docs
      .map(d => ({ id: d.id, ...d.data() }))
      // Support legacy sections that may not have boardId (assign them to default board)
      .filter(s => String(s.boardId || DEFAULT_BOARD_ID) === targetId);
    callback(sections);
  }, (error) => {
    console.error(`Sections subscription error for board [${targetId}]:`, error);
  });
}

/**
 * Subscribe to Posts for a specific board in real time
 */
export function subscribeToPosts(db, boardId, callback) {
  const targetId = String(boardId || DEFAULT_BOARD_ID);
  const q = collection(db, 'posts');
  return onSnapshot(q, (snapshot) => {
    const posts = snapshot.docs
      .map(d => ({ id: d.id, ...d.data() }))
      // Filter by boardId (support legacy posts)
      .filter(p => String(p.boardId || DEFAULT_BOARD_ID) === targetId);
    callback(posts);
  }, (error) => {
    console.error(`Posts subscription error for board [${targetId}]:`, error);
  });
}

/**
 * Create a new board with optional initial sections
 */
export async function createBoard(db, newBoard, sectionsList = []) {
  const boardId = String(newBoard.id);
  const boardRef = doc(db, 'boards', boardId);
  
  await setDoc(boardRef, {
    ...newBoard,
    id: boardId,
    createdAt: newBoard.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  if (sectionsList && sectionsList.length > 0) {
    for (const sec of sectionsList) {
      const secRef = doc(db, 'sections', String(sec.id));
      await setDoc(secRef, {
        ...sec,
        boardId: boardId,
        updatedAt: new Date().toISOString()
      });
    }
  }

  return boardId;
}

/**
 * Update Board
 */
export async function updateBoard(db, boardId, data) {
  const targetId = String(boardId || DEFAULT_BOARD_ID);
  const boardRef = doc(db, 'boards', targetId);
  return await setDoc(boardRef, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
}

/**
 * Delete a Board and all its sections and posts
 */
export async function deleteBoard(db, boardId) {
  const targetId = String(boardId);
  // 1. Delete board doc
  await deleteDoc(doc(db, 'boards', targetId));

  // 2. Delete sections
  const secSnap = await getDocs(collection(db, 'sections'));
  const secDeletes = [];
  secSnap.forEach((d) => {
    if (String(d.data().boardId || DEFAULT_BOARD_ID) === targetId) {
      secDeletes.push(deleteDoc(d.ref));
    }
  });
  await Promise.all(secDeletes);

  // 3. Delete posts
  const postSnap = await getDocs(collection(db, 'posts'));
  const postDeletes = [];
  postSnap.forEach((d) => {
    if (String(d.data().boardId || DEFAULT_BOARD_ID) === targetId) {
      postDeletes.push(deleteDoc(d.ref));
    }
  });
  await Promise.all(postDeletes);
}

/**
 * Add Section
 */
export async function addSection(db, section) {
  const secRef = doc(db, 'sections', String(section.id));
  return await setDoc(secRef, { ...section, updatedAt: new Date().toISOString() });
}

export async function updateSectionTitle(db, sectionId, newTitle) {
  const secRef = doc(db, 'sections', String(sectionId));
  return await updateDoc(secRef, { title: newTitle, updatedAt: new Date().toISOString() });
}

export async function deleteSection(db, sectionId) {
  const secRef = doc(db, 'sections', String(sectionId));
  await deleteDoc(secRef);

  // Also delete associated posts
  const postsSnapshot = await getDocs(collection(db, 'posts'));
  const batchDeletes = [];
  postsSnapshot.forEach((docItem) => {
    if (docItem.data().sectionId === sectionId) {
      batchDeletes.push(deleteDoc(docItem.ref));
    }
  });
  await Promise.all(batchDeletes);
}

/**
 * Add / Update / Delete Post
 */
export async function savePost(db, post) {
  const postRef = doc(db, 'posts', String(post.id));
  return await setDoc(postRef, { ...post, updatedAt: new Date().toISOString() }, { merge: true });
}

export async function updatePostSection(db, postId, newSectionId) {
  const postRef = doc(db, 'posts', String(postId));
  return await updateDoc(postRef, { sectionId: newSectionId, updatedAt: new Date().toISOString() });
}

export async function deletePost(db, postId) {
  const postRef = doc(db, 'posts', String(postId));
  return await deleteDoc(postRef);
}

export async function togglePostReaction(db, post, emoji = '❤️') {
  const postRef = doc(db, 'posts', String(post.id));
  const currentReactions = { ...(post.reactions || (post.likes ? { '❤️': post.likes } : {})) };
  const userReactions = [...(post.userReactions || (post.userLiked ? ['❤️'] : []))];
  
  const hasReacted = userReactions.includes(emoji);
  const updatedUserReactions = hasReacted 
    ? userReactions.filter(e => e !== emoji)
    : [...userReactions, emoji];
  
  const currentCount = currentReactions[emoji] || 0;
  const updatedCount = hasReacted ? Math.max(0, currentCount - 1) : currentCount + 1;
  
  if (updatedCount <= 0) {
    delete currentReactions[emoji];
  } else {
    currentReactions[emoji] = updatedCount;
  }

  const totalLikes = Object.values(currentReactions).reduce((sum, val) => sum + val, 0);

  return await updateDoc(postRef, {
    reactions: currentReactions,
    userReactions: updatedUserReactions,
    likes: totalLikes,
    userLiked: updatedUserReactions.length > 0
  });
}

export async function togglePostLike(db, post) {
  return await togglePostReaction(db, post, '❤️');
}

export async function addCommentToPost(db, postId, currentComments, newComment) {
  const postRef = doc(db, 'posts', String(postId));
  const updatedComments = [...(currentComments || []), newComment];
  return await updateDoc(postRef, { comments: updatedComments });
}

export async function deleteCommentFromPost(db, postId, currentComments, commentId) {
  const postRef = doc(db, 'posts', String(postId));
  const updatedComments = (currentComments || []).filter(c => c.id !== commentId);
  return await updateDoc(postRef, { comments: updatedComments });
}

/**
 * Reset Firestore to initial state
 */
export async function resetFirestoreToInitial(db, initialBoard, initialSections, initialPosts) {
  const sectionsSnap = await getDocs(collection(db, 'sections'));
  const postsSnap = await getDocs(collection(db, 'posts'));

  await Promise.all([
    ...sectionsSnap.docs.map(d => deleteDoc(d.ref)),
    ...postsSnap.docs.map(d => deleteDoc(d.ref))
  ]);

  const targetId = String(initialBoard.id || DEFAULT_BOARD_ID);
  const boardRef = doc(db, 'boards', targetId);
  await setDoc(boardRef, { ...initialBoard, id: targetId, updatedAt: new Date().toISOString() });

  for (const s of initialSections) {
    await setDoc(doc(db, 'sections', String(s.id)), { 
      ...s, 
      boardId: targetId,
      updatedAt: new Date().toISOString() 
    });
  }

  for (const p of initialPosts) {
    await setDoc(doc(db, 'posts', String(p.id)), { 
      ...p, 
      boardId: targetId,
      updatedAt: new Date().toISOString() 
    });
  }
}
