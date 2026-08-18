<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)
const props = defineProps({ values: { type: Array, default: () => [] } })
const chartData = ref({ labels: [], datasets: [] })
const chartOptions = { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 5, ticks: { stepSize: 1 } } }, plugins: { legend: { display: false } } }
function update() { chartData.value = { labels: props.values.map((item) => item.label), datasets: [{ label: 'Average rating', data: props.values.map((item) => Number(item.average.toFixed(2))), backgroundColor: '#176b55', borderRadius: 4 }] } }
watch(() => props.values, update, { deep: true })
onMounted(update)
</script>

<template><div class="chart-wrap"><Bar :data="chartData" :options="chartOptions" aria-label="Interactive average rating chart" /></div></template>
