<template>
  <form @submit.prevent="submitForm" aria-label="user-form">
    <div>
      <label for="lastName">Nom</label>
      <input
        data-testid="lastName-input"
        id="lastName"
        v-model="formData.lastName"
        @input="onFieldInput('lastName')"
        @blur="markFieldTouched('lastName')"
      />
      <p
        v-if="touchedFields.lastName && formErrors.lastName"
        data-testid="error-lastName"
        role="alert"
        :style="errorStyle"
      >
        {{ formErrors.lastName }}
      </p>
    </div>

    <div>
      <label for="firstName">Prénom</label>
      <input
        data-testid="firstName-input"
        id="firstName"
        v-model="formData.firstName"
        @input="onFieldInput('firstName')"
        @blur="markFieldTouched('firstName')"
      />
      <p
        v-if="touchedFields.firstName && formErrors.firstName"
        data-testid="error-firstName"
        role="alert"
        :style="errorStyle"
      >
        {{ formErrors.firstName }}
      </p>
    </div>

    <div>
      <label for="email">Email</label>
      <input
        data-testid="email-input"
        id="email"
        v-model="formData.email"
        @input="onFieldInput('email')"
        @blur="markFieldTouched('email')"
      />
      <p
        v-if="touchedFields.email && formErrors.email"
        data-testid="error-email"
        role="alert"
        :style="errorStyle"
      >
        {{ formErrors.email }}
      </p>
    </div>

    <div>
      <label for="birthDate">Date naissance</label>
      <input
        data-testid="birthDate-input"
        id="birthDate"
        type="date"
        v-model="formData.birthDate"
        @input="onFieldInput('birthDate')"
        @blur="markFieldTouched('birthDate')"
      />
      <p
        v-if="touchedFields.birthDate && formErrors.birthDate"
        data-testid="error-birthDate"
        role="alert"
        :style="errorStyle"
      >
        {{ formErrors.birthDate }}
      </p>
    </div>

    <div>
      <label for="zip">CP</label>
      <input
        data-testid="zip-input"
        id="zip"
        v-model="formData.zip"
        @input="onFieldInput('zip')"
        @blur="markFieldTouched('zip')"
      />
      <p
        v-if="touchedFields.zip && formErrors.zip"
        data-testid="error-zip"
        role="alert"
        :style="errorStyle"
      >
        {{ formErrors.zip }}
      </p>
    </div>

    <div>
      <label for="city">Ville</label>
      <input
        data-testid="city-input"
        id="city"
        v-model="formData.city"
        @input="onFieldInput('city')"
        @blur="markFieldTouched('city')"
      />
      <p
        v-if="touchedFields.city && formErrors.city"
        data-testid="error-city"
        role="alert"
        :style="errorStyle"
      >
        {{ formErrors.city }}
      </p>
    </div>

    <button type="submit" :disabled="!isFormValid" :style="submitButtonStyle">
      Envoyer
    </button>

    <div v-if="toasterMessage" role="status" aria-live="polite">
      {{ toasterMessage }}
    </div>
  </form>
</template>

<script setup>
import { reactive, computed, ref } from "vue"
import {
  validateAdult,
  validateEmail,
  validateIdentity,
  validatePostalCode,
} from "../validators/validator.js"

const formData = reactive({
  lastName: "",
  firstName: "",
  email: "",
  birthDate: "",
  zip: "",
  city: "",
})

const touchedFields = reactive({
  lastName: false,
  firstName: false,
  email: false,
  birthDate: false,
  zip: false,
  city: false,
})

const toasterMessage = ref("")

function normalizeErrorMessage(error) {
  const message = error instanceof Error ? error.message : String(error)

  if (message.includes("getTime") || message.includes("Missing parameter p")) {
    return "Birth date is required"
  }
  if (message.includes("Invalid Date")) {
    return "Birth date is invalid"
  }
  return message
}

function validateCurrentForm() {
  const errors = {
    lastName: "",
    firstName: "",
    email: "",
    birthDate: "",
    zip: "",
    city: "",
  }

  // Identity (first + last)
  try {
    validateIdentity({
      firstName: formData.firstName,
      lastName: formData.lastName,
    })
  } catch (error) {
    const message = normalizeErrorMessage(error)
    errors.firstName = message
    errors.lastName = message
  }

  // Email
  try {
    validateEmail(formData.email)
  } catch (error) {
    errors.email = normalizeErrorMessage(error)
  }

  // Birth date / adult
  try {
    if (!formData.birthDate) throw new Error("Birth date is required")

    const birthDateAsDate = new Date(formData.birthDate)
    if (Number.isNaN(birthDateAsDate.getTime())) throw new Error("Birth date is invalid")

    validateAdult({ birth: birthDateAsDate })
  } catch (error) {
    errors.birthDate = normalizeErrorMessage(error)
  }

  // Zip
  try {
    validatePostalCode(formData.zip)
  } catch (error) {
    errors.zip = normalizeErrorMessage(error)
  }

  // City (règle UI)
  if (!formData.city || formData.city.trim() === "") {
    errors.city = "City is required"
  }

  const isValid = Object.values(errors).every((value) => value === "")
  return { isValid, errors }
}

const validationState = computed(() => validateCurrentForm())
const formErrors = computed(() => validationState.value.errors)
const isFormValid = computed(() => validationState.value.isValid)

function markFieldTouched(fieldName) {
  touchedFields[fieldName] = true
}

function onFieldInput(fieldName) {
  touchedFields[fieldName] = true
}

function markAllTouched() {
  Object.keys(touchedFields).forEach((key) => (touchedFields[key] = true))
}

function resetForm() {
  Object.keys(formData).forEach((key) => (formData[key] = ""))
  Object.keys(touchedFields).forEach((key) => (touchedFields[key] = false))
}

function submitForm() {
  markAllTouched()

  if (!isFormValid.value) return

  localStorage.setItem("userForm", JSON.stringify({ ...formData }))

  toasterMessage.value = "Enregistré"
  setTimeout(() => (toasterMessage.value = ""), 2000)

  resetForm()
}

const errorStyle = { color: "red" }

const submitButtonStyle = computed(() => ({
  opacity: isFormValid.value ? "1" : "0.5",
  cursor: isFormValid.value ? "pointer" : "not-allowed",
}))
</script>