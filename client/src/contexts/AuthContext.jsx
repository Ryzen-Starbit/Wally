import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth'
import {
  doc, getDoc, setDoc, updateDoc,
  arrayUnion, arrayRemove, serverTimestamp, increment,
} from 'firebase/firestore'
import { auth, db, googleProvider } from '../firebase'

const AuthContext = createContext(null)

function getLocalLikes() {
  try { return new Set(JSON.parse(localStorage.getItem('wally_likes') || '[]')) }
  catch { return new Set() }
}

// How much each action shifts tag scores
const DELTAS = {
  view:          0.5,
  like:          2,
  unlike:       -2,
  download:      3,
  rouletteSkip: -1,
}

export function AuthProvider({ children }) {
  const [user, setUser]           = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [likedIds, setLikedIds]   = useState(getLocalLikes)
  const [tagScores, setTagScores] = useState({})  

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        try {
          const userRef  = doc(db, 'users', firebaseUser.uid)
          const userSnap = await getDoc(userRef)
          const localLikes = getLocalLikes()
          if (userSnap.exists()) {
            const data = userSnap.data()
            const firestoreLikes = new Set(data.likes || [])
            const merged = new Set([...firestoreLikes, ...localLikes])
            setLikedIds(merged)
            setTagScores(data.tagScores || {})
            if (localLikes.size > 0) {
              await updateDoc(userRef, { likes: [...merged] })
              localStorage.removeItem('wally_likes')
            }
          } else {
            await setDoc(userRef, {
              email:       firebaseUser.email,
              displayName: firebaseUser.displayName || '',
              photoURL:    firebaseUser.photoURL    || '',
              likes:       [...localLikes],
              tagScores:   {},
              createdAt:   serverTimestamp(),
            })
            setLikedIds(localLikes)
            setTagScores({})
            localStorage.removeItem('wally_likes')
          }
        } catch (err) {
          console.error('Firestore sync error:', err)
        }
      } else {
        setLikedIds(getLocalLikes())
        setTagScores({})
      }

      setAuthLoading(false)
    })

    return unsub
  }, [])

  // updates tagScores 
  const trackInteraction = useCallback(async (tags, action) => {
    if (!Array.isArray(tags) || !tags.length) return
    const delta = DELTAS[action]
    if (delta === undefined) return

    setTagScores(prev => {
      const next = { ...prev }
      for (const tag of tags) {
        next[tag] = parseFloat(((next[tag] || 0) + delta).toFixed(2))
      }
      return next
    })

    // Firestore sync if logged in
    if (auth.currentUser) {
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid)
        const updates = {}
        for (const tag of tags) {
          updates[`tagScores.${tag}`] = increment(delta)
        }
        await updateDoc(userRef, updates)
      } catch (err) {
        console.error('Tag score sync error:', err)
      }
    }
  }, [])

  const toggleLike = useCallback(async (wallpaperId, wallpaperTags) => {
    const isCurrentlyLiked = likedIds.has(wallpaperId)
    setLikedIds(prev => {
      const next = new Set(prev)
      isCurrentlyLiked ? next.delete(wallpaperId) : next.add(wallpaperId)
      if (!auth.currentUser) {
        localStorage.setItem('wally_likes', JSON.stringify([...next]))
      }
      return next
    })
    if (wallpaperTags) {
      trackInteraction(wallpaperTags, isCurrentlyLiked ? 'unlike' : 'like')
    }

    // Firestore sync
    if (auth.currentUser) {
      try {
        const userRef = doc(db, 'users', auth.currentUser.uid)
        await updateDoc(userRef, {
          likes: isCurrentlyLiked
            ? arrayRemove(wallpaperId)
            : arrayUnion(wallpaperId),
        })
      } catch (err) {
        console.error('Like sync error:', err)
        setLikedIds(prev => {
          const next = new Set(prev)
          isCurrentlyLiked ? next.add(wallpaperId) : next.delete(wallpaperId)
          return next
        })
      }
    }
  }, [likedIds, trackInteraction])

  // Auth methods 
  const signUp = async (email, password, displayName) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName })
    return cred
  }
  const signIn       = (email, password) => signInWithEmailAndPassword(auth, email, password)
  const signInGoogle = ()                => signInWithPopup(auth, googleProvider)
  const logout       = ()                => signOut(auth)

  return (
    <AuthContext.Provider value={{
      user, authLoading,
      likedIds, toggleLike,
      tagScores, trackInteraction,
      signUp, signIn, signInGoogle, logout,
    }}>
      {!authLoading && children}
    </AuthContext.Provider>
  )
}
export const useAuth = () => useContext(AuthContext)