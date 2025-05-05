import { ref, computed } from 'vue'

export interface Prompt {
  id?: number
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
}

export interface PromptSearchParams {
  query?: string
  limit?: number
  offset?: number
}

const DB_NAME = 'taoprompt-db'
const DB_VERSION = 1
const STORE_NAME = 'prompts'

export function usePromptDB() {
  const prompts = ref<Prompt[]>([])
  const isLoading = ref(false)
  const error = ref<Error | null>(null)
  
  // Initialize the database
  const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)
      
      request.onerror = (event) => {
        const error = new Error('Failed to open database')
        reject(error)
      }
      
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        resolve(db)
      }
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { 
            keyPath: 'id', 
            autoIncrement: true 
          })
          
          // Create indexes
          store.createIndex('title', 'title', { unique: false })
          store.createIndex('createdAt', 'createdAt', { unique: false })
          store.createIndex('updatedAt', 'updatedAt', { unique: false })
        }
      }
    })
  }
  
  // Add a new prompt
  const addPrompt = async (prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>): Promise<Prompt> => {
    isLoading.value = true
    error.value = null
    
    try {
      const now = new Date()
      const newPrompt: Prompt = {
        ...prompt,
        createdAt: now,
        updatedAt: now
      }
      
      const db = await initDB()
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite')
        const store = transaction.objectStore(STORE_NAME)
        
        const request = store.add(newPrompt)
        
        request.onsuccess = (event) => {
          const id = (event.target as IDBRequest).result as number
          const savedPrompt = { ...newPrompt, id }
          
          // Update local state
          prompts.value = [...prompts.value, savedPrompt]
          resolve(savedPrompt)
        }
        
        request.onerror = () => {
          reject(new Error('Failed to add prompt'))
        }
        
        transaction.oncomplete = () => {
          db.close()
        }
      })
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Unknown error')
      throw error.value
    } finally {
      isLoading.value = false
    }
  }
  
  // Update an existing prompt
  const updatePrompt = async (id: number, updates: Partial<Omit<Prompt, 'id' | 'createdAt'>>): Promise<Prompt> => {
    isLoading.value = true
    error.value = null
    
    try {
      const db = await initDB()
      
      // First get the existing prompt
      const existingPrompt = await getPromptById(id)
      
      if (!existingPrompt) {
        throw new Error(`Prompt with id ${id} not found`)
      }
      
      // Update the prompt
      const updatedPrompt: Prompt = {
        ...existingPrompt,
        ...updates,
        updatedAt: new Date()
      }
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite')
        const store = transaction.objectStore(STORE_NAME)
        
        const request = store.put(updatedPrompt)
        
        request.onsuccess = () => {
          // Update local state
          prompts.value = prompts.value.map(p => 
            p.id === id ? updatedPrompt : p
          )
          resolve(updatedPrompt)
        }
        
        request.onerror = () => {
          reject(new Error('Failed to update prompt'))
        }
        
        transaction.oncomplete = () => {
          db.close()
        }
      })
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Unknown error')
      throw error.value
    } finally {
      isLoading.value = false
    }
  }
  
  // Delete a prompt
  const deletePrompt = async (id: number): Promise<void> => {
    isLoading.value = true
    error.value = null
    
    try {
      const db = await initDB()
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite')
        const store = transaction.objectStore(STORE_NAME)
        
        const request = store.delete(id)
        
        request.onsuccess = () => {
          // Update local state
          prompts.value = prompts.value.filter(p => p.id !== id)
          resolve()
        }
        
        request.onerror = () => {
          reject(new Error('Failed to delete prompt'))
        }
        
        transaction.oncomplete = () => {
          db.close()
        }
      })
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Unknown error')
      throw error.value
    } finally {
      isLoading.value = false
    }
  }
  
  // Get a prompt by ID
  const getPromptById = async (id: number): Promise<Prompt | null> => {
    try {
      const db = await initDB()
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly')
        const store = transaction.objectStore(STORE_NAME)
        
        const request = store.get(id)
        
        request.onsuccess = (event) => {
          const prompt = (event.target as IDBRequest).result as Prompt | undefined
          resolve(prompt || null)
        }
        
        request.onerror = () => {
          reject(new Error('Failed to get prompt'))
        }
        
        transaction.oncomplete = () => {
          db.close()
        }
      })
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Unknown error')
      throw error.value
    }
  }
  
  // Get all prompts with search functionality
  const getPrompts = async (params: PromptSearchParams = {}): Promise<Prompt[]> => {
    isLoading.value = true
    error.value = null
    
    try {
      const { query = '', limit, offset = 0 } = params
      const db = await initDB()
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly')
        const store = transaction.objectStore(STORE_NAME)
        const request = store.index('updatedAt').openCursor(null, 'prev')
        
        const results: Prompt[] = []
        let counter = 0
        
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result as IDBCursorWithValue | null
          
          if (cursor) {
            const prompt = cursor.value as Prompt
            
            // Apply search filter if query is provided
            const matchesSearch = query === '' || 
              prompt.title.toLowerCase().includes(query.toLowerCase()) || 
              prompt.content.toLowerCase().includes(query.toLowerCase())
            
            if (matchesSearch) {
              if (counter >= offset) {
                results.push(prompt)
              }
              counter++
              
              // Check if we've reached the limit
              if (limit && results.length >= limit) {
                prompts.value = results
                resolve(results)
                return
              }
            }
            
            cursor.continue()
          } else {
            // No more results
            prompts.value = results
            resolve(results)
          }
        }
        
        request.onerror = () => {
          reject(new Error('Failed to get prompts'))
        }
        
        transaction.oncomplete = () => {
          db.close()
        }
      })
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Unknown error')
      throw error.value
    } finally {
      isLoading.value = false
    }
  }
  
  // Count total prompts (optionally filtered by search)
  const countPrompts = async (searchQuery: string = ''): Promise<number> => {
    try {
      const db = await initDB()
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly')
        const store = transaction.objectStore(STORE_NAME)
        const request = store.openCursor()
        
        let count = 0
        
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result as IDBCursorWithValue | null
          
          if (cursor) {
            const prompt = cursor.value as Prompt
            
            // Apply search filter if query is provided
            const matchesSearch = searchQuery === '' || 
              prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
              prompt.content.toLowerCase().includes(searchQuery.toLowerCase())
            
            if (matchesSearch) {
              count++
            }
            
            cursor.continue()
          } else {
            // No more results
            resolve(count)
          }
        }
        
        request.onerror = () => {
          reject(new Error('Failed to count prompts'))
        }
        
        transaction.oncomplete = () => {
          db.close()
        }
      })
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Unknown error')
      throw error.value
    }
  }
  
  // Load initial data
  const loadPrompts = (params: PromptSearchParams = {}) => {
    getPrompts(params).catch(err => {
      console.error('Failed to load prompts:', err)
    })
  }
  
  return {
    prompts: computed(() => prompts.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    addPrompt,
    updatePrompt,
    deletePrompt,
    getPromptById,
    getPrompts,
    countPrompts,
    loadPrompts
  }
}
