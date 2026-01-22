/**
 * Firestore Sync Engine
 * 
 * Push/Pull data between IndexedDB and Firestore.
 * Strategy: Last-write-wins based on updatedAt timestamp.
 * 
 * Collection structure: users/{uid}/{storeName}/{docId}
 */

import { db, auth, collection, doc, setDoc, getDocs, serverTimestamp } from './firebase'
import { getDB } from './db'

// Stores to sync (matches IndexedDB store names)
const SYNCABLE_STORES = ['pages', 'notebooks', 'habits', 'journals']

/**
 * Get current user ID
 */
function getCurrentUserId() {
    return auth?.currentUser?.uid || null
}

/**
 * Check if Firestore sync is available
 */
export function isFirestoreSyncAvailable() {
    return db !== null && auth?.currentUser !== null
}

/**
 * Push a single store from IndexedDB to Firestore
 */
async function pushStore(storeName) {
    const userId = getCurrentUserId()
    if (!userId || !db) return { success: false, error: 'Not authenticated' }

    try {
        const localDb = await getDB()
        const localData = await localDb.getAll(storeName)

        let pushed = 0
        for (const item of localData) {
            // Create Firestore document reference
            const docRef = doc(db, 'users', userId, storeName, item.id)

            // Prepare data for Firestore
            const firestoreData = {
                ...item,
                syncedAt: serverTimestamp(),
                // Ensure updatedAt is a proper timestamp
                updatedAt: item.updatedAt || item.updated_at || new Date().toISOString(),
            }

            // Upsert to Firestore (merge to preserve existing fields)
            await setDoc(docRef, firestoreData, { merge: true })
            pushed++
        }

        console.log(`Pushed ${pushed} items to ${storeName}`)
        return { success: true, count: pushed }
    } catch (err) {
        console.error(`Push ${storeName} failed:`, err)
        return { success: false, error: err.message }
    }
}

/**
 * Pull a single store from Firestore to IndexedDB
 */
async function pullStore(storeName) {
    const userId = getCurrentUserId()
    if (!userId || !db) return { success: false, error: 'Not authenticated' }

    try {
        const localDb = await getDB()

        // Get all documents from Firestore collection
        const collectionRef = collection(db, 'users', userId, storeName)
        const snapshot = await getDocs(collectionRef)

        let pulled = 0
        for (const docSnap of snapshot.docs) {
            const remoteData = docSnap.data()
            const localData = await localDb.get(storeName, remoteData.id)

            // Get timestamps for comparison
            const remoteUpdated = remoteData.updatedAt ? new Date(remoteData.updatedAt) : new Date(0)
            const localUpdated = localData?.updatedAt ? new Date(localData.updatedAt) :
                localData?.updated_at ? new Date(localData.updated_at) : new Date(0)

            // Only update if remote is newer or local doesn't exist
            if (!localData || remoteUpdated > localUpdated) {
                await localDb.put(storeName, {
                    ...remoteData,
                    sync_status: 'synced',
                })
                pulled++
            }
        }

        console.log(`Pulled ${pulled} items from ${storeName}`)
        return { success: true, count: pulled }
    } catch (err) {
        console.error(`Pull ${storeName} failed:`, err)
        return { success: false, error: err.message }
    }
}

/**
 * Push all syncable stores to Firestore
 */
export async function pushToFirestore() {
    if (!isFirestoreSyncAvailable()) {
        return { success: false, error: 'Firestore not available or not authenticated' }
    }

    const results = {}
    for (const store of SYNCABLE_STORES) {
        results[store] = await pushStore(store)
    }

    const allSuccess = Object.values(results).every(r => r.success)
    return { success: allSuccess, results }
}

/**
 * Pull all syncable stores from Firestore
 */
export async function pullFromFirestore() {
    if (!isFirestoreSyncAvailable()) {
        return { success: false, error: 'Firestore not available or not authenticated' }
    }

    const results = {}
    for (const store of SYNCABLE_STORES) {
        results[store] = await pullStore(store)
    }

    const allSuccess = Object.values(results).every(r => r.success)
    return { success: allSuccess, results }
}

/**
 * Full sync - push then pull
 * Push first to ensure local changes are saved, then pull remote changes
 */
export async function fullSync() {
    if (!isFirestoreSyncAvailable()) {
        return { success: false, error: 'Firestore not available or not authenticated' }
    }

    console.log('Starting Firestore sync...')

    // Push local changes first
    const pushResult = await pushToFirestore()

    // Then pull remote changes
    const pullResult = await pullFromFirestore()

    const success = pushResult.success && pullResult.success

    console.log('Firestore sync complete:', { pushResult, pullResult })

    return {
        success,
        pushed: pushResult.results || {},
        pulled: pullResult.results || {},
        error: pushResult.error || pullResult.error,
    }
}

export default {
    isFirestoreSyncAvailable,
    pushToFirestore,
    pullFromFirestore,
    fullSync,
}
