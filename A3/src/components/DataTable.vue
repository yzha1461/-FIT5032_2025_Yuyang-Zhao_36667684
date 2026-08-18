<script setup>
import { computed, ref } from 'vue'
import { ArrowDownAZ, ArrowUpAZ, ChevronLeft, ChevronRight, Search } from 'lucide-vue-next'

const props = defineProps({
  title: { type: String, required: true },
  rows: { type: Array, default: () => [] },
  columns: { type: Array, required: true },
  pageSize: { type: Number, default: 10 },
})

const filters = ref(Object.fromEntries(props.columns.map((column) => [column.key, ''])))
const sortKey = ref(props.columns[0]?.key || '')
const sortDirection = ref('asc')
const page = ref(1)

const filtered = computed(() => props.rows.filter((row) => props.columns.every((column) => String(row[column.key] ?? '').toLowerCase().includes(filters.value[column.key].toLowerCase()))))
const sorted = computed(() => [...filtered.value].sort((a, b) => {
  const left = String(a[sortKey.value] ?? '').toLowerCase()
  const right = String(b[sortKey.value] ?? '').toLowerCase()
  const result = left.localeCompare(right, undefined, { numeric: true })
  return sortDirection.value === 'asc' ? result : -result
}))
const totalPages = computed(() => Math.max(1, Math.ceil(sorted.value.length / props.pageSize)))
const visibleRows = computed(() => sorted.value.slice((page.value - 1) * props.pageSize, page.value * props.pageSize))

function sortBy(key) {
  if (sortKey.value === key) sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  else { sortKey.value = key; sortDirection.value = 'asc' }
  page.value = 1
}
function changePage(next) { page.value = Math.min(totalPages.value, Math.max(1, next)) }
</script>

<template>
  <section class="table-card" :aria-labelledby="`${title.replaceAll(' ', '-')}-title`">
    <div class="table-card-heading"><div><p class="eyebrow">Interactive data</p><h2 :id="`${title.replaceAll(' ', '-')}-title`">{{ title }}</h2></div><span>{{ filtered.length }} rows</span></div>
    <div class="table-scroll">
      <table>
        <thead>
          <tr><th v-for="column in columns" :key="column.key" scope="col"><button class="sort-button" type="button" @click="sortBy(column.key)">{{ column.label }} <ArrowUpAZ v-if="sortKey === column.key && sortDirection === 'asc'" :size="16" /><ArrowDownAZ v-if="sortKey === column.key && sortDirection === 'desc'" :size="16" /></button></th></tr>
          <tr class="filter-row"><th v-for="column in columns" :key="`${column.key}-filter`"><label class="filter-label"><Search :size="15" /><span class="sr-only">Search {{ column.label }}</span><input v-model="filters[column.key]" type="search" :placeholder="`Search ${column.label}`" @input="page = 1"></label></th></tr>
        </thead>
        <tbody><tr v-for="(row, index) in visibleRows" :key="row.id || index"><td v-for="column in columns" :key="column.key">{{ row[column.key] }}</td></tr><tr v-if="!visibleRows.length"><td :colspan="columns.length" class="empty-cell">No matching records.</td></tr></tbody>
      </table>
    </div>
    <div class="table-footer"><span>Page {{ page }} of {{ totalPages }} - 10 rows maximum per page</span><div><button class="icon-button" type="button" :disabled="page === 1" aria-label="Previous page" @click="changePage(page - 1)"><ChevronLeft :size="18" /></button><button class="icon-button" type="button" :disabled="page === totalPages" aria-label="Next page" @click="changePage(page + 1)"><ChevronRight :size="18" /></button></div></div>
  </section>
</template>
