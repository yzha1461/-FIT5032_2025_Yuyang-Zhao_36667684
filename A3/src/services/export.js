import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export function downloadCsv(rows, columns, filename) {
  const csv = [columns.map((column) => column.label), ...rows.map((row) => columns.map((column) => row[column.key] ?? ''))].map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a'); link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url)
}

export function downloadPdf(rows, columns, title, filename) {
  const doc = new jsPDF({ orientation: 'landscape' })
  doc.setFontSize(16); doc.text(title, 14, 16)
  autoTable(doc, { startY: 24, head: [columns.map((column) => column.label)], body: rows.map((row) => columns.map((column) => String(row[column.key] ?? ''))), styles: { fontSize: 8 } })
  doc.save(filename)
}
