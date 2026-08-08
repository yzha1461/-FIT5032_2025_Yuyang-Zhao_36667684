<template>
  <div class="container cloud-page">
    <section class="hero cloud-hero">
      <p class="eyebrow">FIT5032 Assessed Lab 9.1</p>
      <h1>Book Counter</h1>
      <p>Ask the deployed Cloud Function to count books in the Firestore library collection.</p>
    </section>

    <section class="cloud-panel" aria-labelledby="count-title">
      <div class="panel-heading">
        <div>
          <span class="section-label">Cloud Function</span>
          <h2 id="count-title">Firestore count</h2>
        </div>
        <span class="status" :class="{ ready: count !== null }">
          {{ count === null ? 'Ready' : '200 OK' }}
        </span>
      </div>

      <button class="action-button" type="button" :disabled="loading" @click="getBookCount">
        {{ loading ? 'Requesting...' : 'Get Book Count' }}
      </button>

      <p v-if="message" class="message" :class="messageType" role="status">{{ message }}</p>

      <div v-if="count !== null" class="result" aria-live="polite">
        <strong>{{ count }}</strong>
        <span>total books in Firestore</span>
      </div>

      <pre v-if="response" class="json-block" aria-label="Cloud Function JSON response">{{ JSON.stringify(response, null, 2) }}</pre>
    </section>
  </div>
</template>

<script setup>
import axios from 'axios'
import { ref } from 'vue'

const functionUrl = import.meta.env.VITE_COUNT_BOOKS_FUNCTION_URL || ''
const loading = ref(false)
const count = ref(null)
const response = ref(null)
const message = ref('')
const messageType = ref('info')

const getBookCount = async () => {
  if (!functionUrl) {
    messageType.value = 'error'
    message.value = 'Cloud Function URL is not configured. Add VITE_COUNT_BOOKS_FUNCTION_URL.'
    return
  }

  loading.value = true
  message.value = ''
  try {
    const result = await axios.get(functionUrl)
    response.value = result.data
    count.value = Number(result.data?.count ?? 0)
    messageType.value = 'success'
    message.value = 'The deployed Cloud Function returned the Firestore count.'
  } catch (error) {
    count.value = null
    response.value = null
    messageType.value = 'error'
    message.value = error.response?.data?.error || error.message || 'Cloud Function request failed.'
  } finally {
    loading.value = false
  }
}

defineExpose({ getBookCount })
</script>

<style scoped>
.cloud-page {
  max-width: 900px;
}

.cloud-hero {
  color: #fff;
  background: #155e75;
  border-color: #155e75;
}

.cloud-hero .eyebrow,
.cloud-hero p:last-child {
  color: #cffafe !important;
}

.cloud-panel {
  margin-top: 1.5rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #fff;
  padding: 22px;
}

.panel-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.panel-heading h2 {
  margin: 4px 0 0;
}

.section-label {
  color: #0e7490;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.status {
  border: 1px solid #cbd5e1;
  border-radius: 999px;
  color: #475569;
  font-size: 0.8rem;
  font-weight: 800;
  padding: 5px 8px;
}

.status.ready {
  border-color: #86efac;
  background: #f0fdf4;
  color: #166534;
}

.action-button {
  min-height: 42px;
  border: 1px solid #0e7490;
  border-radius: 5px;
  background: #0e7490;
  color: #fff;
  cursor: pointer;
  font-weight: 700;
  padding: 0 14px;
}

.action-button:disabled {
  cursor: wait;
  opacity: 0.6;
}

.message {
  margin: 16px 0 0;
  border-radius: 5px;
  padding: 10px 12px;
}

.message.info {
  background: #f0f9ff;
  color: #075985;
}

.message.success {
  background: #f0fdf4;
  color: #166534;
}

.message.error {
  background: #fff1f2;
  color: #9f1239;
}

.result {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-top: 22px;
  border-top: 1px solid #bae6fd;
  padding-top: 18px;
}

.result strong {
  color: #155e75;
  font-size: 3rem;
  line-height: 1;
}

.result span {
  color: #475569;
}

.json-block {
  overflow-x: auto;
  margin: 18px 0 0;
  border-radius: 8px;
  background: #0f172a;
  color: #cffafe;
  padding: 16px;
  font-size: 0.86rem;
  line-height: 1.55;
}

@media (max-width: 600px) {
  .cloud-panel {
    padding: 16px;
  }

  .panel-heading {
    flex-direction: column;
  }
}
</style>
