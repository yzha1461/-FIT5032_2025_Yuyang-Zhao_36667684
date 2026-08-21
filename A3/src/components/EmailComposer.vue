<script setup>
import { ref } from 'vue'
import { FilePlus2, Mail, Send } from 'lucide-vue-next'
import { apiPost } from '../services/api'

const props = defineProps({ recipients: { type: Array, default: () => [] } })
const subject = ref('SilverCare community update')
const body = ref('Thank you for staying connected with SilverCare Connect.')
const attachment = ref(null)
const message = ref('')
const sending = ref(false)
const recipientText = ref(props.recipients.join(', '))

function chooseFile(event) { attachment.value = event.target.files?.[0] || null }
async function send() {
  sending.value = true; message.value = ''
  try {
    const recipients = recipientText.value.split(',').map((email) => email.trim()).filter(Boolean)
    if (!recipients.length) throw new Error('Enter at least one recipient email address.')
    let encoded = null
    if (attachment.value) encoded = { name: attachment.value.name, type: attachment.value.type, data: await toBase64(attachment.value) }
    const result = await apiPost('/email/send', { recipients, subject: subject.value, body: body.value, attachment: encoded })
    message.value = result.delivered ? `Sent to ${result.recipientCount} recipients.` : `Accepted in demo mode for ${result.recipientCount} recipients.`
  } catch (error) { message.value = error.message } finally { sending.value = false }
}
function toBase64(file) { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result).split(',')[1]); reader.onerror = reject; reader.readAsDataURL(file) }) }
</script>

<template>
  <section class="email-card" aria-labelledby="email-title">
    <div class="section-heading"><div><p class="eyebrow">D.2 / F.1 innovation</p><h2 id="email-title">Bulk email with attachment</h2></div><Mail :size="28" aria-hidden="true" /></div>
    <p class="muted-copy">The service sends a validated message with optional attachments. The deployed environment uses Resend; local builds require a provider secret.</p>
    <form @submit.prevent="send"><label>Recipients (comma-separated)<input v-model="recipientText" type="email" multiple placeholder="member@example.com" required><span class="field-hint">For Resend test mode, use the verified account email.</span></label><label>Subject<input v-model="subject" type="text" maxlength="150" required></label><label>Message<textarea v-model="body" rows="4" maxlength="5000" required></textarea></label><label class="file-label"><FilePlus2 :size="18" /> Attachment<input type="file" accept=".pdf,.csv,.txt,.png,.jpg" @change="chooseFile"></label><span v-if="attachment" class="field-hint">{{ attachment.name }}</span><button class="primary-button" type="submit" :disabled="sending"><Send :size="18" /> {{ sending ? 'Sending...' : 'Send email' }}</button></form>
    <p v-if="message" class="alert success" role="status">{{ message }}</p>
  </section>
</template>
