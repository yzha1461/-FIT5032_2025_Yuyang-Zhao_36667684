<template>
  <section class="container">
    <div class="mx-auto content-panel">
      <span class="badge text-bg-success mb-3">Members Area</span>
      <h1 class="h2 fw-bold mb-3">About Our Library</h1>
      <p class="lead">
        Welcome to our digital library. We provide a curated collection of books,
        author records, and reading resources for registered members.
      </p>
      <p>
        This page is protected with Vue Router navigation guards. Users must log
        in before they can access the members-only About page.
      </p>
    </div>
  </section>
</template>

<style scoped>
.content-panel {
  max-width: 760px;
  background: #fff;
  border: 1px solid #dfe7f3;
  border-radius: 8px;
  padding: 2rem;
}
</style>
