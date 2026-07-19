<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-12 col-sm-10 col-md-8 col-lg-6">
        <div class="text-center mb-4">
          <span class="badge text-bg-primary mb-2">FIT5032 Assessed Lab 3</span>
          <h1 class="display-6 fw-bold">User Information Form / Credentials</h1>
          <p class="text-muted mb-0">
            Bootstrap-powered Vue form with responsive breakpoint classes.
          </p>
        </div>

        <form class="border rounded-3 bg-light p-3 p-sm-4 shadow-sm" @submit.prevent="submitForm">
          <div class="mb-3">
            <label for="username" class="form-label">Username:</label>
            <input
              type="text"
              class="form-control"
              id="username"
              v-model.trim="formData.username"
              placeholder="Enter your username"
              required
            >
          </div>

          <div class="mb-3">
            <label for="password" class="form-label">Password:</label>
            <input
              type="password"
              class="form-control"
              id="password"
              v-model="formData.password"
              placeholder="Enter your password"
              required
            >
          </div>

          <div class="form-check mb-3">
            <input
              type="checkbox"
              class="form-check-input"
              id="isAustralian"
              v-model="formData.isAustralian"
            >
            <label for="isAustralian" class="form-check-label">Australian Resident?</label>
          </div>

          <div class="mb-3">
            <label for="gender" class="form-label">Gender</label>
            <select class="form-select" id="gender" v-model="formData.gender" required>
              <option disabled value="">Please select a gender</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div class="mb-4">
            <label for="reason" class="form-label">Reason For Joining:</label>
            <textarea
              class="form-control"
              id="reason"
              rows="3"
              v-model.trim="formData.reason"
              placeholder="Tell us why you are joining"
              required
            ></textarea>
          </div>

          <div class="d-grid gap-2 d-sm-flex justify-content-sm-end">
            <button type="submit" class="btn btn-primary">Submit</button>
            <button type="button" class="btn btn-secondary" @click="clearForm">Clear</button>
          </div>
        </form>
      </div>
    </div>

    <div class="row mt-5" v-if="submittedCards.length">
      <div class="col-12">
        <h2 class="h4 text-center mb-3">Submitted User Information</h2>
        <div class="d-flex flex-wrap justify-content-center justify-content-md-start">
          <div
            v-for="(card, index) in submittedCards"
            :key="index"
            class="card m-2"
            style="width: 18rem;"
          >
            <div class="card-header">User Information</div>
            <ul class="list-group list-group-flush">
              <li class="list-group-item">Username: {{ card.username }}</li>
              <li class="list-group-item">Password: {{ card.password }}</li>
              <li class="list-group-item">
                Australian Resident: {{ card.isAustralian ? 'Yes' : 'No' }}
              </li>
              <li class="list-group-item">Gender: {{ card.gender }}</li>
              <li class="list-group-item">Reason: {{ card.reason }}</li>
            </ul>
          </div>
        </div>
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
  reason: '',
  gender: ''
})

const formData = ref(emptyForm())
const submittedCards = ref([])

const submitForm = () => {
  submittedCards.value.push({ ...formData.value })
}

const clearForm = () => {
  formData.value = emptyForm()
}
</script>

<style scoped>
.card {
  border: 1px solid #ccc;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-header {
  background-color: #275fda;
  color: white;
  padding: 10px;
  border-radius: 10px 10px 0 0;
}

.list-group-item {
  padding: 10px;
}
</style>
