<template>
  <div class="container api-page">
    <section class="hero">
      <p class="eyebrow">FIT5032 Assessed Lab 10.3</p>
      <h1>Count Book API</h1>
      <p>A local JSON data service that reports the number of authors and books.</p>
    </section>

    <section class="api-panel" aria-labelledby="count-heading">
      <div class="panel-heading">
        <div>
          <span class="section-label">API response</span>
          <h2 id="count-heading">Authors and books</h2>
        </div>
        <span class="status">200 OK</span>
      </div>
      <div class="stats-grid">
        <div class="stat"><strong>{{ apiResponse.data.authorsCount }}</strong><span>authors</span></div>
        <div class="stat"><strong>{{ apiResponse.data.totalBooks }}</strong><span>books</span></div>
      </div>
      <pre class="json-block" aria-label="JSON API response">{{ JSON.stringify(apiResponse, null, 2) }}</pre>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import authors from '../assets/json/authors.json'

const apiResponse = computed(() => ({
  success: true,
  data: {
    authorsCount: authors.length,
    totalBooks: authors.reduce((total, author) => total + author.famousWorks.length, 0),
    authors: authors.map((author) => ({ name: author.name, bookCount: author.famousWorks.length }))
  },
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(150px, 240px));
  gap: 12px;
}

.stat {
  border: 1px solid #dbe1ea;
  border-radius: 8px;
  background: #f8fafc;
  padding: 14px;
}

.stat strong {
  display: block;
  color: #0f766e;
  font-size: 2rem;
}

.stat span {
  color: #5d6776;
}

.json-block {
  overflow-x: auto;
  margin: 18px 0 0;
  border: 1px solid #dbe1ea;
  border-radius: 8px;
  background: #111827;
  color: #d1fae5;
  padding: 16px;
  font-size: 0.86rem;
  line-height: 1.55;
}

@media (max-width: 500px) {
  .api-panel {
    padding: 16px;
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
