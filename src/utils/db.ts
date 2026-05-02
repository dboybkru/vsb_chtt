import { DB_NAME, DB_VERSION, STORE_NAME, DEFAULT_CATALOG_URL } from '@/data/constants'
import type { Product } from '@/types'

export function openLocalDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB недоступен'))
      return
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME)
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function idbGet<T>(key: string, fallback: T): Promise<T> {
  try {
    const db = await openLocalDb()
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const request = tx.objectStore(STORE_NAME).get(key)
      request.onsuccess = () => resolve(request.result ?? fallback)
      request.onerror = () => reject(request.error)
    })
  } catch {
    return fallback
  }
}

export async function idbSet(key: string, value: unknown): Promise<boolean> {
  try {
    const db = await openLocalDb()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      tx.objectStore(STORE_NAME).put(value, key)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
    return true
  } catch {
    return false
  }
}

export async function idbDelete(key: string): Promise<boolean> {
  try {
    const db = await openLocalDb()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      tx.objectStore(STORE_NAME).delete(key)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
    return true
  } catch {
    return false
  }
}

export async function loadDefaultCatalog(): Promise<Product[]> {
  const response = await fetch(DEFAULT_CATALOG_URL, { cache: 'no-store' })
  if (!response.ok) throw new Error('Не удалось загрузить стартовый каталог')
  const products = (await response.json()) as Product[]
  return Array.isArray(products) ? products : []
}
