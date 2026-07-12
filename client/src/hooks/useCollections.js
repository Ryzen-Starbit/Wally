import { useState, useEffect, useCallback } from 'react'
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  query, where, onSnapshot, arrayUnion, arrayRemove,
  serverTimestamp, getDoc, setDoc,
} from 'firebase/firestore'
import { db, auth } from '../firebase'

export function useCollections(user) {
  const [collections, setCollections] = useState([])
  const [loading, setLoading]         = useState(false)

  useEffect(() => {
    if (!user) { setCollections([]); return }
    setLoading(true)
    const q = query(
      collection(db, 'collections'),
      where('ownerId', '==', user.uid)
    )

    const unsub = onSnapshot(q, snap => {
      const cols = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      cols.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0))
      setCollections(cols)
      setLoading(false)
    })
    return unsub
  }, [user])

  // Create new collection 
  const createCollection = useCallback(async (name, wallpaperId = null) => {
    if (!auth.currentUser) return null
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') +
      '-' + Math.random().toString(36).slice(2, 6)
    const ref = await addDoc(collection(db, 'collections'), {
      name,
      slug,
      ownerId:     auth.currentUser.uid,
      ownerName:   auth.currentUser.displayName || 'User',
      wallpapers:  wallpaperId ? [wallpaperId] : [],
      isPublic:    false,
      createdAt:   serverTimestamp(),
      updatedAt:   serverTimestamp(),
    })
    return ref.id
  }, [])

  // Add wallpaper to collection
  const addToCollection = useCallback(async (collectionId, wallpaperId) => {
    await updateDoc(doc(db, 'collections', collectionId), {
      wallpapers: arrayUnion(wallpaperId),
      updatedAt:  serverTimestamp(),
    })
  }, [])

  // Remove wallpaper from collection
  const removeFromCollection = useCallback(async (collectionId, wallpaperId) => {
    await updateDoc(doc(db, 'collections', collectionId), {
      wallpapers: arrayRemove(wallpaperId),
      updatedAt:  serverTimestamp(),
    })
  }, [])

  // Delete collection
  const deleteCollection = useCallback(async (collectionId) => {
    await deleteDoc(doc(db, 'collections', collectionId))
  }, [])

  const togglePublic = useCallback(async (collectionId, current) => {
    await updateDoc(doc(db, 'collections', collectionId), {
      isPublic: !current,
    })
  }, [])
  const renameCollection = useCallback(async (collectionId, newName) => {
    await updateDoc(doc(db, 'collections', collectionId), {
      name:      newName,
      updatedAt: serverTimestamp(),
    })
  }, [])

  return {
    collections, loading,
    createCollection, addToCollection, removeFromCollection,
    deleteCollection, togglePublic, renameCollection,
  }
}

//Fetch a public collection (no auth needed) 
export async function fetchPublicCollection(slug) {
  const q = query(
    collection(db, 'collections'),
    where('slug', '==', slug),
    where('isPublic', '==', true)
  )
  const { getDocs } = await import('firebase/firestore')
  const snap = await getDocs(q)
  if (snap.empty) return null
  return { id: snap.docs[0].id, ...snap.docs[0].data() }
}