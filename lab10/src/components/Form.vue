<template>
  <div class="container py-4 py-md-5">
    <div class="row justify-content-center">
      <div class="col-12 col-lg-9 col-xl-8">
        <div class="mb-4 text-center">
          <span class="badge text-bg-primary mb-2">FIT5032 Assessed Lab 4</span>
          <h1 class="h2 fw-bold">User Information Form</h1>
        </div>

        <form class="border rounded bg-light p-3 p-sm-4 shadow-sm" novalidate @submit.prevent="submitForm">
          <div class="mb-3">
            <label for="username" class="form-label">Username:</label>
            <input
              id="username"
              v-model.trim="formData.username"
              type="text"
              class="form-control"
              :class="{ 'is-invalid': errors.username }"
              placeholder="Enter your username"
              @blur="validateName(true)"
              @input="validateName(false)"
            >
            <div v-if="errors.username" class="invalid-feedback">{{ errors.username }}</div>
          </div>

          <div class="mb-3">
            <label for="password" class="form-label">Password:</label>
            <input
              id="password"
              v-model="formData.password"
              type="password"
              class="form-control"
              :class="{ 'is-invalid': errors.password }"
              placeholder="Enter your password"
              @blur="validatePassword(true)"
              @input="validatePassword(false)"
            >
            <div v-if="errors.password" class="invalid-feedback">{{ errors.password }}</div>
          </div>

          <div class="mb-3">
            <div class="form-check">
              <input
                id="isAustralian"
                v-model="formData.isAustralian"
                type="checkbox"
                class="form-check-input"
                :class="{ 'is-invalid': errors.isAustralian }"
                @change="validateResident(true)"
              >
              <label for="isAustralian" class="form-check-label">Australian Resident?</label>
              <div v-if="errors.isAustralian" class="invalid-feedback">
                {{ errors.isAustralian }}
              </div>
            </div>
          </div>

          <div class="mb-3">
            <label for="gender" class="form-label">Gender</label>
            <select
              id="gender"
              v-model="formData.gender"
              class="form-select"
              :class="{ 'is-invalid': errors.gender }"
              @blur="validateGender(true)"
              @change="validateGender(false)"
            >
              <option disabled value="">Please select a gender</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
            <div v-if="errors.gender" class="invalid-feedback">{{ errors.gender }}</div>
          </div>

          <div class="mb-4">
            <label for="reason" class="form-label">Reason For Joining:</label>
            <textarea
              id="reason"
              v-model.trim="formData.reason"
              class="form-control"
              :class="{ 'is-invalid': errors.reason }"
              rows="3"
              placeholder="Tell us why you are joining"
              @blur="validateReason(true)"
              @input="validateReason(false)"
            ></textarea>
            <div v-if="errors.reason" class="invalid-feedback">{{ errors.reason }}</div>
          </div>

          <div class="d-grid gap-2 d-sm-flex justify-content-sm-end">
            <button type="submit" class="btn btn-primary">Submit</button>
            <button type="button" class="btn btn-secondary" @click="clearForm">Clear</button>
          </div>
        </form>
      </div>
    </div>

    <section v-if="submittedUsers.length" class="mt-5" aria-labelledby="submitted-heading">
      <h2 id="submitted-heading" class="h4 text-center mb-3">Submitted User Information</h2>
      <DataTable
        :value="submittedUsers"
        paginator
        :rows="5"
        :rows-per-page-options="[5, 10, 20]"
        striped-rows
        show-gridlines
        responsive-layout="scroll"
        table-style="min-width: 48rem"
      >
        <Column field="username" header="Username" sortable />
        <Column field="password" header="Password" />
        <Column field="residentLabel" header="Australian Resident" sortable />
        <Column field="gender" header="Gender" sortable />
        <Column field="reason" header="Reason for Joining" />
      </DataTable>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

const emptyForm = () => ({
  username: '',
  password: '',
  isAustralian: false,
  gender: '',
  reason: ''
})

const emptyErrors = () => ({
  username: null,
  password: null,
  isAustralian: null,
  gender: null,
  reason: null
})

const formData = ref(emptyForm())
const errors = ref(emptyErrors())
const submittedUsers = ref([])

const setError = (field, message, showError) => {
  if (showError || !message) errors.value[field] = message
  return !message
}

const validateName = (blur) => {
  const message = formData.value.username.length < 3
    ? 'Name must be at least 3 characters'
    : null
  return setError('username', message, blur)
}

const validatePassword = (blur) => {
  const password = formData.value.password
  const isStrong = password.length >= 8
    && /[A-Z]/.test(password)
    && /[a-z]/.test(password)
    && /\d/.test(password)
    && /[!@#$%^&*(),.?":{}|<>]/.test(password)
  const message = isStrong
    ? null
    : 'Password must be at least 8 characters and include uppercase, lowercase, number and special character'
  return setError('password', message, blur)
}

const validateResident = (blur) => {
  const message = formData.value.isAustralian
    ? null
    : 'Please confirm that you are an Australian resident'
  return setError('isAustralian', message, blur)
}

const validateGender = (blur) => {
  const message = formData.value.gender ? null : 'Please select a gender'
  return setError('gender', message, blur)
}

const validateReason = (blur) => {
  const message = formData.value.reason.length >= 10
    ? null
    : 'Reason must be at least 10 characters'
  return setError('reason', message, blur)
}

const validateForm = () => {
  const results = [
    validateName(true),
    validatePassword(true),
    validateResident(true),
    validateGender(true),
    validateReason(true)
  ]
  return results.every(Boolean)
}

const submitForm = () => {
  if (!validateForm()) return

  submittedUsers.value.push({
    ...formData.value,
    residentLabel: formData.value.isAustralian ? 'Yes' : 'No'
  })
  clearForm()
}

const clearForm = () => {
  formData.value = emptyForm()
  errors.value = emptyErrors()
}
</script>

<style scoped>
.invalid-feedback {
  display: block;
}

section {
  overflow-x: auto;
}
</style>
