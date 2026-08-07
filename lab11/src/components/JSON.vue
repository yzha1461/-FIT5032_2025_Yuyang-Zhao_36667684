<template>
  <section class="hero">
    <p class="eyebrow">FIT5032 Assessed Lab 2</p>
    <h1>Library Web Application</h1>
    <p>
      Vue app demonstrating computed properties, built-in directives, attribute
      binding, class binding, and style binding.
    </p>
  </section>

  <section class="activity">
    <div class="activity-heading">
      <span>Activity 1</span>
      <h2>Import JSON files</h2>
    </div>
    <p>
      The app imports <code>authors.json</code> and <code>bookstores.json</code>
      from <code>src/assets/json</code>.
    </p>
    <div class="stats-grid">
      <div class="stat">
        <strong>{{ authors.length }}</strong>
        <span>authors loaded</span>
      </div>
      <div class="stat">
        <strong>{{ bookstores.length }}</strong>
        <span>bookstores loaded</span>
      </div>
      <div class="stat">
        <strong>{{ allFamousWorks.length }}</strong>
        <span>famous works mapped</span>
      </div>
    </div>
  </section>

  <section class="activity">
    <div class="activity-heading">
      <span>Activity 2</span>
      <h2>Get authors born after 1850</h2>
    </div>
    <p>Computed property: <code>modernAuthors</code></p>
    <pre class="code-block">const modernAuthors = computed(() =>
  authors.filter((author) => author.birthYear &gt; 1850)
)</pre>
  </section>

  <section class="activity">
    <div class="activity-heading">
      <span>Activity 3</span>
      <h2>Get all famous works</h2>
    </div>
    <p>Computed property: <code>allFamousWorks</code></p>
    <pre class="code-block">const allFamousWorks = computed(() =>
  authors.flatMap((author) =&gt; author.famousWorks.map((work) =&gt; work.title))
)</pre>
  </section>

  <section class="activity">
    <div class="activity-heading">
      <span>Activity 6</span>
      <h2>Render author names and birth years</h2>
    </div>
    <h3>Working with JSON Arrays</h3>
    <p>Our <code>authors.json</code> contains an array of author objects.</p>
    <ul class="list">
      <li
        v-for="author in authors"
        :key="author.id"
        :title="authorTitle(author)"
        :class="{ 'highlight-author': isGeorgeOrwell(author) }"
        :style="authorHighlightStyle(author)"
      >
        {{ author.name }} ({{ author.birthYear }})
      </li>
    </ul>
  </section>

  <section class="activity">
    <div class="activity-heading">
      <span>Activity 7</span>
      <h2>Render authors born after 1850</h2>
    </div>
    <h3>Filtering Arrays</h3>
    <p>Authors born after 1850:</p>
    <ul class="list">
      <li
        v-for="author in modernAuthors"
        :key="author.id"
        :title="authorTitle(author)"
        :class="{ 'highlight-author': isGeorgeOrwell(author) }"
        :style="authorHighlightStyle(author)"
      >
        {{ author.name }} ({{ author.birthYear }})
      </li>
    </ul>
  </section>

  <section class="activity">
    <div class="activity-heading">
      <span>Activity 8</span>
      <h2>Render all famous works</h2>
    </div>
    <h3>Mapping Arrays</h3>
    <p>Famous works:</p>
    <ul class="list">
      <li v-for="work in allFamousWorks" :key="work">{{ work }}</li>
    </ul>
  </section>

  <section class="activity">
    <div class="activity-heading">
      <span>Activity 13</span>
      <h2>Toggle message visibility</h2>
    </div>
    <h3>v-if &amp; v-else</h3>
    <p>Toggle visibility based on a condition.</p>
    <button class="toggle-button" @click="showMessage = !showMessage">Toggle Message</button>
    <p v-if="showMessage" class="message success">You're a Vue superstar!</p>
    <p v-else class="message">Click the button to see a message.</p>
  </section>

  <section class="activity distinction">
    <div class="activity-heading">
      <span>Task 2.2</span>
      <h2>Attribute, class and style bindings</h2>
    </div>
    <p>
      George Orwell is highlighted using <code>:title</code>, <code>:class</code>,
      and <code>:style</code> bindings.
    </p>
    <ul class="list">
      <li
        v-for="author in authors"
        :key="`highlight-${author.id}`"
        :title="authorTitle(author)"
        :class="{ 'highlight-author': isGeorgeOrwell(author) }"
        :style="authorHighlightStyle(author)"
      >
        <span>{{ author.name }}</span>
        <span>{{ author.genre }}</span>
      </li>
    </ul>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import authors from '../assets/json/authors.json'
import bookstores from '../assets/json/bookstores.json'

const showMessage = ref(false)

const modernAuthors = computed(() =>
  authors.filter((author) => author.birthYear > 1850)
)

const allFamousWorks = computed(() =>
  authors.flatMap((author) => author.famousWorks.map((work) => work.title))
)

const isGeorgeOrwell = (author) => author?.name === 'George Orwell'

const authorTitle = (author) =>
  isGeorgeOrwell(author)
    ? 'Highlighted author: George Orwell'
    : `Author: ${author?.name ?? 'Unknown'}`

const authorHighlightStyle = (author) =>
  isGeorgeOrwell(author)
    ? {
        borderColor: '#f59e0b',
        backgroundColor: '#fff7ed',
        color: '#7c2d12',
        fontWeight: '700'
      }
    : {}
</script>
