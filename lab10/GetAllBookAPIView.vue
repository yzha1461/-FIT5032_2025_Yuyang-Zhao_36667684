<template>
  <div class="container api-page">
    <section class="hero">
      <p class="eyebrow">FIT5032 Assessed Lab 10.3</p>
      <h1>GetAllBookAPI</h1>
      <p>All books transformed from the local authors JSON file and returned as JSON.</p>
    </section>

    <section class="api-panel" aria-labelledby="all-books-heading">
      <div class="panel-heading">
        <div>
          <span class="section-label">API response</span>
          <h2 id="all-books-heading">All books</h2>
        </div>
        <span class="status">200 OK</span>
      </div>
      <pre class="json-block" aria-label="All books JSON response">{{ JSON.stringify(apiResponse, null, 2) }}</pre>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import authors from '../assets/json/authors.json'

const books = authors.flatMap((author) => author.famousWorks.map((book) => ({
  title: book.title,
  year: book.year,
  author: author.name
})))

const apiResponse = computed(() => ({
  success: true,
  count: books.length,
  data: books,
  timestamp: new Date().toISOString()
}))

defineExpose({ apiResponse })
</script>

<style scoped>
.api-page {
  max-width: 960px;
}

.api-panel {
  border: 1px solid #d7dde8;
  border-radius: 8px;
  background: #ffffff;
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
  color: #0f766e;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.status {
  border-radius: 999px;
  background: #dcfce7;
  color: #166534;
  font-size: 0.8rem;
  font-weight: 800;
  padding: 5px 8px;
}

.json-block {
  overflow-x: auto;
  max-height: 70vh;
  margin: 0;
  border: 1px solid #dbe1ea;
  border-radius: 8px;
  background: #111827;
  color: #d1fae5;
  padding: 16px;
  font-size: 0.86rem;
  line-height: 1.55;
}

@media (max-width: 600px) {
  .api-panel {
    padding: 16px;
  }
}
</style>
