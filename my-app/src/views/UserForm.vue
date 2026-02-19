<template>
  <div class="form-container">
    <form @submit.prevent="submitForm" aria-label="user-form" class="form">
      <h2 class="form-title">Inscription</h2>

      <div class="form-group">
        <label for="lastName">Nom</label>
        <input
          data-testid="lastName-input"
          id="lastName"
          v-model="formData.lastName"
          @input="onFieldInput('lastName')"
          @blur="markFieldTouched('lastName')"
          class="form-input"
        />
        <p
          v-if="touchedFields.lastName && formErrors.lastName"
          data-testid="error-lastName"
          role="alert"
          class="error-message"
        >
          {{ formErrors.lastName }}
        </p>
      </div>

      <div class="form-group">
        <label for="firstName">Prénom</label>
        <input
          data-testid="firstName-input"
          id="firstName"
          v-model="formData.firstName"
          @input="onFieldInput('firstName')"
          @blur="markFieldTouched('firstName')"
          class="form-input"
        />
        <p
          v-if="touchedFields.firstName && formErrors.firstName"
          data-testid="error-firstName"
          role="alert"
          class="error-message"
        >
          {{ formErrors.firstName }}
        </p>
      </div>

      <div class="form-group">
        <label for="email">Email</label>
        <input
          data-testid="email-input"
          id="email"
          v-model="formData.email"
          @input="onFieldInput('email')"
          @blur="markFieldTouched('email')"
          class="form-input"
        />
        <p
          v-if="touchedFields.email && formErrors.email"
          data-testid="error-email"
          role="alert"
          class="error-message"
        >
          {{ formErrors.email }}
        </p>
      </div>

      <div class="form-group">
        <label for="birthDate">Date de naissance</label>
        <input
          data-testid="birthDate-input"
          id="birthDate"
          type="date"
          v-model="formData.birthDate"
          @input="onFieldInput('birthDate')"
          @blur="markFieldTouched('birthDate')"
          class="form-input"
        />
        <p
          v-if="touchedFields.birthDate && formErrors.birthDate"
          data-testid="error-birthDate"
          role="alert"
          class="error-message"
        >
          {{ formErrors.birthDate }}
        </p>
      </div>

      <div class="form-group">
        <label for="zip">Code Postal</label>
        <input
          data-testid="zip-input"
          id="zip"
          v-model="formData.zip"
          @input="onFieldInput('zip')"
          @blur="markFieldTouched('zip')"
          class="form-input"
        />
        <p
          v-if="touchedFields.zip && formErrors.zip"
          data-testid="error-zip"
          role="alert"
          class="error-message"
        >
          {{ formErrors.zip }}
        </p>
      </div>

      <div class="form-group">
        <label for="city">Ville</label>
        <input
          data-testid="city-input"
          id="city"
          v-model="formData.city"
          @input="onFieldInput('city')"
          @blur="markFieldTouched('city')"
          class="form-input"
        />
        <p
          v-if="touchedFields.city && formErrors.city"
          data-testid="error-city"
          role="alert"
          class="error-message"
        >
          {{ formErrors.city }}
        </p>
      </div>

      <button type="submit" :disabled="!isFormValid" class="form-button" :class="{ 'form-button--disabled': !isFormValid }">
        Envoyer
      </button>

      <div v-if="toasterMessage" class="toaster-message" role="status" aria-live="polite">
        {{ toasterMessage }}
      </div>

      <router-link to="/" class="back-link">Retour à l'accueil</router-link>
    </form>
  </div>
</template>


<script setup>
import { reactive, computed, ref } from "vue";
import { useRouter } from 'vue-router';
import { useUsersStore } from '@/stores/users';
import {
  validateAdult,
  validateEmail,
  validateIdentity,
  validatePostalCode,
} from "../validators/validator.js";

const router = useRouter();
const usersStore = useUsersStore();

const formData = reactive({
  lastName: "",
  firstName: "",
  email: "",
  birthDate: "",
  zip: "",
  city: "",
});

const touchedFields = reactive({
  lastName: false,
  firstName: false,
  email: false,
  birthDate: false,
  zip: false,
  city: false,
});

const toasterMessage = ref("");

function normalizeErrorMessage(error) {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes("getTime") || message.includes("Missing parameter p")) {
    return "Birth date is required";
  }
  if (message.includes("Invalid Date")) {
    return "Birth date is invalid";
  }
  return message;
}

function validateCurrentForm() {
  const errors = {
    lastName: "",
    firstName: "",
    email: "",
    birthDate: "",
    zip: "",
    city: "",
  };

  // Identity (first + last)
  try {
    validateIdentity({
      firstName: formData.firstName,
      lastName: formData.lastName,
    });
  } catch (error) {
    const message = normalizeErrorMessage(error);
    errors.firstName = message;
    errors.lastName = message;
  }

  // Email
  try {
    validateEmail(formData.email);
  } catch (error) {
    errors.email = normalizeErrorMessage(error);
  }

  // Birth date / adult
  try {
    if (!formData.birthDate) throw new Error("Birth date is required");

    const birthDateAsDate = new Date(formData.birthDate);
    if (Number.isNaN(birthDateAsDate.getTime())) throw new Error("Birth date is invalid");

    validateAdult({ birth: birthDateAsDate });
  } catch (error) {
    errors.birthDate = normalizeErrorMessage(error);
  }

  // Zip
  try {
    validatePostalCode(formData.zip);
  } catch (error) {
    errors.zip = normalizeErrorMessage(error);
  }

  // City (règle UI)
  if (!formData.city || formData.city.trim() === "") {
    errors.city = "City is required";
  }

  const isValid = Object.values(errors).every((value) => value === "");
  return { isValid, errors };
}

const validationState = computed(() => validateCurrentForm());
const formErrors = computed(() => validationState.value.errors);
const isFormValid = computed(() => validationState.value.isValid);

function markFieldTouched(fieldName) {
  touchedFields[fieldName] = true;
}

function onFieldInput(fieldName) {
  touchedFields[fieldName] = true;
}

function markAllTouched() {
  Object.keys(touchedFields).forEach((key) => (touchedFields[key] = true));
}

function resetForm() {
  Object.keys(formData).forEach((key) => (formData[key] = ""));
  Object.keys(touchedFields).forEach((key) => (touchedFields[key] = false));
}

function submitForm() {
  markAllTouched();

  if (!isFormValid.value) return;

  usersStore.addUser({ ...formData });
  router.push('/');

  toasterMessage.value = "Enregistré";
  setTimeout(() => (toasterMessage.value = ""), 2000);
  resetForm();
}
</script>
<style scoped>
.form-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #121212;
  padding: 20px;
}

.form {
  background-color: #1e1e1e;
  border-radius: 10px;
  padding: 30px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.form-title {
  color: #ffffff;
  text-align: center;
  margin-bottom: 25px;
  font-size: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #bb86fc;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 12px;
  border-radius: 5px;
  border: 1px solid #333;
  background-color: #2d2d2d;
  color: #ffffff;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #bb86fc;
}

.error-message {
  color: #ff5252;
  font-size: 14px;
  margin-top: 5px;
}

.form-button {
  width: 100%;
  padding: 12px;
  background-color: #bb86fc;
  color: #ffffff;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.form-button:hover {
  background-color: #9a67ea;
}

.form-button--disabled {
  background-color: #444;
  cursor: not-allowed;
}

.toaster-message {
  margin-top: 20px;
  padding: 10px;
  background-color: #388e3c;
  color: #ffffff;
  text-align: center;
  border-radius: 5px;
}

.back-link {
  display: block;
  text-align: center;
  margin-top: 20px;
  color: #bb86fc;
  text-decoration: none;
  font-weight: 500;
}

.back-link:hover {
  text-decoration: underline;
}
</style>