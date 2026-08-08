<template>
  <section class="card border-0 shadow-sm">
    <div class="card-body p-4">
      <div class="d-flex flex-column flex-md-row justify-content-between gap-3 mb-3">
        <div>
          <p class="text-uppercase text-primary fw-bold small mb-2">Firestore Query</p>
          <h2 class="h4 fw-bold mb-1">Books with ISBN greater than 1000</h2>
          <p class="text-secondary mb-0">Query uses where, orderBy and limit on the books collection.</p>
        </div>
        <button class="btn btn-outline-primary align-self-md-start" type="button" @click="loadBooks">
          Refresh
        </button>
      </div>

      <div v-if="message" class="alert" :class="messageClass">
        {{ message }}
      </div>

      <div class="table-responsive">
        <table class="table align-middle">
          <thead>
            <tr>
              <th scope="col">ISBN</th>
              <th scope="col">Book Name</th>
              <th scope="col" class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="book in books" :key="book.id">
              <td style="width: 180px">
                <input v-model.number="book.editIsbn" class="form-control" type="number" min="1" />
              </td>
              <td>
                <input v-model="book.editName" class="form-control" type="text" />
              </td>
              <td class="text-end text-nowrap">
                <button class="btn btn-sm btn-success me-2" type="button" @click="updateBook(book)">
                  Update
                </button>
                <button class="btn btn-sm btn-outline-danger" type="button" @click="deleteBook(book.id)">
                  Delete
                </button>
              </td>
            </tr>
            <tr v-if="!isLoading && books.length === 0">
              <td colspan="3" class="text-center text-secondary py-4">
                No books matched the query.
              </td>
            </tr>
            <tr v-if="isLoading">
              <td colspan="3" class="text-center text-secondary py-4">
                Loading books...
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where
} from 'firebase/firestore'
import { db } from '../Firebase/init'

const props = defineProps({
  refreshKey: {
    type: Number,
    default: 0
  }
})

const books = ref([])
const isLoading = ref(false)
const message = ref('')
const messageType = ref('success')

const messageClass = computed(() =>
  messageType.value === 'success' ? 'alert-success' : 'alert-danger'
)

const loadBooks = async () => {
  isLoading.value = true
  message.value = ''

  try {
    const booksQuery = query(
      collection(db, 'books'),
      where('isbn', '>', 1000),
      orderBy('isbn', 'asc'),
      limit(10)
    )
    const snapshot = await getDocs(booksQuery)

    books.value = snapshot.docs.map((bookDocument) => {
      const data = bookDocument.data()
      return {
        id: bookDocument.id,
        isbn: data.isbn,
        name: data.name,
        editIsbn: data.isbn,
        editName: data.name
      }
    })
  } catch (error) {
    messageType.value = 'error'
    message.value = error.code || error.message
    console.error('Firestore query error:', error)
  } finally {
    isLoading.value = false
  }
}

const updateBook = async (book) => {
  if (!book.editName.trim() || Number.isNaN(Number(book.editIsbn))) {
    messageType.value = 'error'
    message.value = 'ISBN and book name are required before updating.'
    return
  }

  try {
    await updateDoc(doc(db, 'books', book.id), {
      isbn: Number(book.editIsbn),
      name: book.editName.trim(),
      updatedAt: serverTimestamp()
    })
    messageType.value = 'success'
    message.value = 'Book updated successfully.'
    await loadBooks()
  } catch (error) {
    messageType.value = 'error'
    message.value = error.code || error.message
    console.error('Firestore update error:', error)
  }
}

const deleteBook = async (bookId) => {
  try {
    await deleteDoc(doc(db, 'books', bookId))
    messageType.value = 'success'
    message.value = 'Book deleted successfully.'
    await loadBooks()
  } catch (error) {
    messageType.value = 'error'
    message.value = error.code || error.message
    console.error('Firestore delete error:', error)
  }
}

watch(
  () => props.refreshKey,
  () => {
    loadBooks()
  }
)

onMounted(() => {
  loadBooks()
})
</script>
