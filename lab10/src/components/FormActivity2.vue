<template>
  <div class="container py-4 py-md-5">
    <div class="row justify-content-center">
      <div class="col-12 col-lg-8">
        <div class="mb-4 text-center">
          <span class="badge text-bg-primary mb-2">FIT5032 Assessed Lab 4</span>
          <h1 class="h2 fw-bold">User Information Form</h1>
        </div>

        <form class="border rounded bg-light p-3 p-sm-4 shadow-sm" @submit.prevent="submitForm">
          <div class="mb-3">
            <label for="username" class="form-label">Username:</label>
            <input
              id="username"
              v-model.trim="formData.username"
              type="text"
              class="form-control"
              placeholder="Enter your username"
              required
              @invalid="setValidationMessage($event, 'Please fill out this field.')"
              @input="clearValidationMessage"
            >
          </div>

          <div class="mb-3">
            <label for="password" class="form-label">Password:</label>
            <input
              id="password"
              v-model="formData.password"
              type="password"
              class="form-control"
              placeholder="Enter your password"
              required
              minlength="4"
              maxlength="10"
              @invalid="setPasswordMessage"
              @input="clearValidationMessage"
            >
          </div>

          <div class="mb-3">
            <div class="form-check">
              <input
                id="isAustralian"
                v-model="formData.isAustralian"
                type="checkbox"
                class="form-check-input"
                required
                @invalid="setValidationMessage($event, 'Please check this box if you want to proceed.')"
                @change="clearValidationMessage"
              >
              <label for="isAustralian" class="form-check-label">Australian Resident?</label>
            </div>
          </div>

          <div class="mb-3">
            <label for="gender" class="form-label">Gender</label>
            <select
              id="gender"
              v-model="formData.gender"
              class="form-select"
              required
              @invalid="setValidationMessage($event, 'Please select an item in the list.')"
              @change="clearValidationMessage"
            >
              <option disabled value="">Please select a gender</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div class="mb-4">
            <label for="reason" class="form-label">Reason For Joining:</label>
            <textarea
              id="reason"
              v-model.trim="formData.reason"
              class="form-control"
              rows="3"
              placeholder="Tell us why you are joining"
              required
              @invalid="setValidationMessage($event, 'Please fill out this field.')"
              @input="clearValidationMessage"
            ></textarea>
          </div>

          <div class="d-grid gap-2 d-sm-flex justify-content-sm-end">
            <button type="submit" class="btn btn-primary">Submit</button>
            <button type="button" class="btn btn-secondary" @click="clearForm">Clear</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emptyForm = () => ({
  username: '',
  password: '',
  isAustralian: false,
  gender: '',
  reason: ''
})

const formData = ref(emptyForm())

const setValidationMessage = (event, message) => {
  event.target.setCustomValidity(message)
}

const setPasswordMessage = (event) => {
  const password = event.target
  const message = password.validity.tooShort
    ? 'Please lengthen this text to 4 characters or more.'
    : 'Please fill out this field.'
  password.setCustomValidity(message)
}

const clearValidationMessage = (event) => {
  event.target.setCustomValidity('')
}

const submitForm = () => {
  clearForm()
}

const clearForm = () => {
  formData.value = emptyForm()
}
</script>
