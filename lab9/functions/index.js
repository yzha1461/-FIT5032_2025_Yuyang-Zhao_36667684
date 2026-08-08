import cors from 'cors'
import { getFirestore } from 'firebase-admin/firestore'
import { initializeApp } from 'firebase-admin/app'
import { onRequest } from 'firebase-functions/v2/https'

initializeApp()

const db = getFirestore()
const corsHandler = cors({ origin: true })

const withCors = (handler) => (req, res) => new Promise((resolve, reject) => {
  corsHandler(req, res, async () => {
    try {
      await handler(req, res)
      resolve()
    } catch (error) {
      reject(error)
    }
  })
})

const readBooks = async () => {
  const snapshot = await db.collection('books').orderBy('isbn', 'asc').get()
  return snapshot.docs.map((bookDocument) => {
    const data = bookDocument.data()
    return {
      id: bookDocument.id,
      isbn: Number(data.isbn) || 0,
      name: String(data.name || 'Untitled book')
    }
  })
}

export const countBooks = onRequest(
  { region: 'asia-east1' },
  withCors(async (req, res) => {
    if (req.method !== 'GET') {
      res.status(405).json({ success: false, error: 'Only GET requests are supported.' })
      return
    }

    try {
      const snapshot = await db.collection('books').get()
      res.status(200).json({
        success: true,
        collection: 'books',
        count: snapshot.size,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('countBooks failed:', error)
      res.status(500).json({ success: false, error: 'Unable to count Firestore books.' })
    }
  })
)

export const bookInsights = onRequest(
  { region: 'asia-east1' },
  withCors(async (req, res) => {
    if (req.method !== 'GET') {
      res.status(405).json({ success: false, error: 'Only GET requests are supported.' })
      return
    }

    try {
      const books = await readBooks()
      const isbnTotal = books.reduce((total, book) => total + book.isbn, 0)
      const isbnGroups = books.reduce((groups, book) => {
        const band = book.isbn >= 2000 ? '2000 and above' : 'Below 2000'
        groups[band] = (groups[band] || 0) + 1
        return groups
      }, {})

      res.status(200).json({
        success: true,
        title: 'NoMash Library inventory insights',
        data: {
          totalBooks: books.length,
          averageIsbn: books.length ? Math.round(isbnTotal / books.length) : 0,
          isbnGroups,
          books
        },
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('bookInsights failed:', error)
      res.status(500).json({ success: false, error: 'Unable to read Firestore book data.' })
    }
  })
)
