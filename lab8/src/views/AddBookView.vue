<template>
  <section class="container">
    <div class="row justify-content-center">
      <div class="col-xl-9">
        <div class="card border-0 shadow-sm mb-4">
          <div class="card-body p-4">
            <p class="text-uppercase text-primary fw-bold small mb-2">Firestore Database</p>
            <h1 class="h2 fw-bold mb-3">Add Book</h1>

            <form novalidate @submit.prevent="addBook">
              <div class="row g-3">
                <div class="col-md-4">
                  <label for="isbn" class="form-label">ISBN</label>
                  <input
                    id="isbn"
                    v-model.number="isbn"
                    class="form-control"
                    min="1"
                    required
                    type="number"
                  />
                </div>

                <div class="col-md-8">
                  <label for="bookName" class="form-label">Name</label>
                  <input
                    id="bookName"
                    v-model="name"
                    class="form-control"
                    required
                    type="text"
                  />
                </div>
              </div>

              <button class="btn btn-primary mt-4" :disabled="isSubmitting" type="submit">
                {{ isSubmitting ? 'Adding book...' : 'Add Book' }}
              </button>
            </form>

            <div v-if="message" class="alert mt-4 mb-0" :class="messageClass">
              {{ message }}
            </div>
          </div>
        </div>

        <BookList :refresh-key="refreshKey" />
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import BookList from '../components/BookList.vue'
import { db } from '../Firebase/init'

const isbn = ref(null)
const name = ref('')
const isSubmitting = ref(false)
const message = ref('')
const messageType = ref('success')
const refreshKey = ref(0)

const messageClass = computed(() =>
  messageType.value === 'success' ? 'alert-success' : 'alert-danger'
)

const addBook = async () => {
  if (!name.value.trim() || Number.isNaN(Number(isbn.value))) {
    messageType.value = 'error'
    message.value = 'ISBN and name are required.'
    return
  }

  isSubmitting.value = true
  message.value = ''

  try {
    await addDoc(collection(db, 'books'), {
      isbn: Number(isbn.value),
      name: name.value.trim(),
      createdAt: serverTimestamp()
    })

    messageType.value = 'success'
    message.value = 'Book added successfully. Check Firestore books collection.'
    isbn.value = null
    name.value = ''
    refreshKey.value += 1
  } catch (error) {
    messageType.value = 'error'
    message.value = error.code || error.message
    console.error('Firestore add book error:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>
