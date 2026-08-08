<template>
  <div class="container cloud-page">
    <section class="hero insight-hero">
      <p class="eyebrow">FIT5032 Assessed Lab 9.2</p>
      <h1>Library Insights</h1>
      <p>A custom Cloud Function transforms the Firestore book collection into an inventory report.</p>
    </section>

    <section class="cloud-panel" aria-labelledby="insight-title">
      <div class="panel-heading">
        <div>
          <span class="section-label">Cloud Function</span>
          <h2 id="insight-title">Inventory report</h2>
        </div>
        <button class="action-button" type="button" :disabled="loading" @click="loadInsights">
          {{ loading ? 'Loading...' : 'Load report' }}
        </button>
      </div>

      <p v-if="message" class="message" :class="messageType" role="status">{{ message }}</p>

      <div v-if="report" class="stats-grid">
        <div class="stat"><strong>{{ report.totalBooks }}</strong><span>Total books</span></div>
        <div class="stat"><strong>{{ report.averageIsbn }}</strong><span>Average ISBN</span></div>
      </div>

      <div v-if="report" class="group-list">
        <div v-for="(value, label) in report.isbnGroups" :key="label" class="group-row">
          <span>{{ label }}</span><strong>{{ value }}</strong>
        </div>
      </div>

      <div v-if="report?.books?.length" class="table-wrap">
        <table>
          <thead><tr><th>ISBN</th><th>Book</th></tr></thead>
          <tbody>
            <tr v-for="book in report.books" :key="book.id">
              <td>{{ book.isbn }}</td><td>{{ book.name }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-else-if="report" class="empty">No books are currently stored in Firestore.</p>
    </section>
  </div>
</template>

<script setup>
import axios from 'axios'
import { ref } from 'vue'

const functionUrl = import.meta.env.VITE_BOOK_INSIGHTS_FUNCTION_URL || ''
const loading = ref(false)
const report = ref(null)
const message = ref('')
const messageType = ref('info')

const loadInsights = async () => {
  if (!functionUrl) {
    messageType.value = 'error'
    message.value = 'Cloud Function URL is not configured. Add VITE_BOOK_INSIGHTS_FUNCTION_URL.'
    return
  }

  loading.value = true
  message.value = ''
  try {
    const result = await axios.get(functionUrl)
    report.value = result.data?.data || null
    messageType.value = 'success'
    message.value = 'The Cloud Function returned a Firestore inventory report.'
  } catch (error) {
    report.value = null
    messageType.value = 'error'
    message.value = error.response?.data?.error || error.message || 'Cloud Function request failed.'
  } finally {
    loading.value = false
  }
}

defineExpose({ loadInsights })
</script>

<style scoped>
.cloud-page {
  max-width: 900px;
}

.insight-hero {
  color: #fff;
  background: #7c2d12;
  border-color: #7c2d12;
}

.insight-hero .eyebrow,
.insight-hero p:last-child {
  color: #ffedd5 !important;
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
}

.panel-heading h2 {
  margin: 4px 0 0;
}

.section-label {
  color: #c2410c;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.action-button {
  min-height: 42px;
  border: 1px solid #c2410c;
  border-radius: 5px;
  background: #c2410c;
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

.message.success {
  background: #f0fdf4;
  color: #166534;
}

.message.error {
  background: #fff1f2;
  color: #9f1239;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(140px, 220px));
  gap: 12px;
  margin-top: 20px;
}

.stat {
  border: 1px solid #fed7aa;
  border-radius: 8px;
  background: #fff7ed;
  padding: 14px;
}

.stat strong {
  display: block;
  color: #9a3412;
  font-size: 2rem;
}

.stat span {
  color: #7c2d12;
}

.group-list {
  margin-top: 18px;
  border-top: 1px solid #fed7aa;
}

.group-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid #ffedd5;
  padding: 10px 0;
}

.group-row strong {
  color: #9a3412;
}

.table-wrap {
  overflow-x: auto;
  margin-top: 18px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border-bottom: 1px solid #e2e8f0;
  padding: 10px 8px;
  text-align: left;
}

th {
  color: #7c2d12;
  font-size: 0.82rem;
  text-transform: uppercase;
}

.empty {
  margin: 20px 0 0;
  color: #64748b;
}

@media (max-width: 600px) {
  .cloud-panel {
    padding: 16px;
  }

  .panel-heading {
    flex-direction: column;
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
