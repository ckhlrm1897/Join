/**
 * Selects const that are used for workflow.
 * @type {NodeListOf<HTMLImageElement>}
 */
const pwIcons = document.querySelectorAll('.pw_icon');
const pwInputs = document.querySelectorAll('.pw_input');
const lockIcon = "./assets/icons/lock.svg";
const eyeIcon = "./assets/icons/visibility_off.svg";
const eyeOffIcon = "./assets/icons/visibility.svg";
const userNameInput = document.querySelector('#login-username');
const userPasswordInput = document.querySelector('#login-userpassword');
const loginBtn = document.querySelector('.login_btn');
const guestLoginBtn = document.querySelector('.guest_login_btn');
const signinForm = document.getElementById("signin-form");
const signinContainer = document.getElementById("signin-container");
const signinNameInput = document.getElementById("signin-contactname");
const signinEmailInput = document.getElementById("signin-username");
const signinPasswordInput = document.getElementById("signin-userpassword");
const signinPasswordCheckInput = document.getElementById("signin-userpassword-check");
const signinCheckbox = document.getElementById("signin-btn-checkbox");
const signupBtn = document.querySelector('#sign-up');
const signupBtnHover = document.querySelector('.curser_pointer');
const labelHover = document.querySelector('.signin_btn_checkbox_img_wrapper');
const dialogSignin = document.getElementById("dialog_signin");
const toggleSignIn = document.querySelector('.btn_sign_up');
const toggleLogIn = document.querySelector('#signin-btn-back');
const toggleMemberLogin = document.querySelector('.btn_member');
const togglePrivacyCheck = document.getElementById('sign-up-label');
const welcomeContent = document.querySelector(".welcome_content");
let isPasswordVisible = false;

// Initialization after document is loaded
document.addEventListener('DOMContentLoaded', function () {
  fadeWelcome();
  setUserIsLoggedOut()
  validateSigninForm();
  setupLoginListeners();
  setupSigninListeners();
  setupToggleListeners();
  setupPasswordToggle();
  setupPrivacyCheckboxListener();
  setupHoverPrivacyCheckboxListener();
});

/**
 * Displays an error message for a given input field.
 * @param {HTMLInputElement} input - The input element.
 * @param {string} message - The error message to display.
 */
function showInputError(input, message) {
  const wrapper = input.closest('.input_icon_wrapper');
  let errorDiv = wrapper ? wrapper.querySelector('.input_error') : null;
  input.classList.add('input_error_border');
  if (errorDiv) errorDiv.innerText = message || '';
  updatePwIcons();
}

/**
 * Clears the error message from a given input field.
 * @param {HTMLInputElement} input - The input element.
 */
function clearInputError(input) {
  const wrapper = input.closest('.input_icon_wrapper');
  let errorDiv = wrapper ? wrapper.querySelector('.input_error') : null;
  input.classList.remove('input_error_border');
  if (errorDiv) errorDiv.innerText = '';
  updatePwIcons();
}

/**
 * Enables or disables the sign-up button.
 * @param {boolean} isDisabled - If true, disables the button.
 */
function setSignupBtnState(isDisabled) {
  signupBtn.disabled = isDisabled;
  signupBtn.style.cursor = isDisabled ? "not-allowed" : "pointer";
}

/**
 * Updates all password icons based on the current state of the input fields.
 */
function updatePwIcons() {
  for (let i = 0; i < pwInputs.length; i++) {
    if (pwInputs[i].value.length === 0) {
      pwIcons[i].src = lockIcon;
      pwIcons[i].style.cursor = "default";
      pwInputs[i].type = "password";
    } else {
      if (isPasswordVisible) {
        pwInputs[i].type = "text";
        pwIcons[i].src = eyeOffIcon;
      } else {
        pwInputs[i].type = "password";
        pwIcons[i].src = eyeIcon;
      }
      pwIcons[i].style.cursor = "pointer";
    }
  }
}

/**
 * Displays a login error and marks both login fields as erroneous.
 * @param {string} message - The error message to display.
 */
function showLoginErrorBothRed(message) {
  userNameInput.classList.add('input_error_border');
  userPasswordInput.classList.add('input_error_border');
  setLoginErrorMessage(userNameInput, "");
  setLoginErrorMessage(userPasswordInput, message);
  updatePwIcons();
}

/**
 * Sets the error message for a specific login input field.
 * @param {HTMLInputElement} input - The input element.
 * @param {string} message - The error message to display.
 */
function setLoginErrorMessage(input, message) {
  const wrapper = input.closest('.input_icon_wrapper');
  if (wrapper) {
    const errorDiv = wrapper.querySelector('.input_error');
    if (errorDiv) errorDiv.innerText = message || '';
  }
}

/**
 * Clears login errors from both login fields.
 */
function clearLoginError() {
  clearInputError(userNameInput);
  clearInputError(userPasswordInput);
}

/**
 * Validates if a given email is in a valid format.
 * @param {string} email - The email address to validate.
 * @returns {boolean} True if the email is valid.
 */
function isValidEmail(email) {
  let trimmedEmail = email.trim();
  return checkEmailAt(trimmedEmail) && checkEmailDot(trimmedEmail) && checkEmailNoSpace(trimmedEmail);
}

/**
 * Checks if the email contains a single @ and it's not the first character.
 * @param {string} email - The email address.
 * @returns {boolean}
 */
function checkEmailAt(email) {
  const atIndex = email.indexOf('@');
  if (atIndex === -1) return false;
  const secondAt = email.indexOf('@', atIndex + 1);
  if (secondAt !== -1) return false;
  if (atIndex < 1) return false;
  return true;
}

/**
 * Checks if the email contains a dot after the @.
 * @param {string} email - The email address.
 * @returns {boolean}
 */
function checkEmailDot(email) {
  const atIndex = email.indexOf('@');
  const dotIndex = email.indexOf('.', atIndex);
  if (dotIndex === -1 || dotIndex === email.length - 1) return false;
  return true;
}

/**
 * Checks if the email does not contain spaces.
 * @param {string} email - The email address.
 * @returns {boolean}
 */
function checkEmailNoSpace(email) {
  return !email.includes(' ');
}

/**
 * Checks if a given string is a valid full name (first and last name).
 * @param {string} name - The full name.
 * @returns {boolean}
 */
function isValidFullName(name) {
  let trimmedName = name.trim();
  const parts = trimmedName.split(/\s+/);
  if (parts.length < 2) return false;
  return checkNameParts(parts);
}

/**
 * Checks if all name parts contain only letters (including German umlauts and ß).
 * @param {string[]} parts - The name parts.
 * @returns {boolean}
 */
function checkNameParts(parts) {
  const letterRegex = /^[A-Za-zÄÖÜäöüß]+$/;
  for (let i = 0; i < parts.length; i++) {
    if (!letterRegex.test(parts[i])) return false;
  }
  return true;
}

/**
 * Formats a full name (capitalizes first letter of each part).
 * @param {string} name - The full name.
 * @returns {string}
 */
function formatFullName(name) {
  let trimmedName = name.trim();
  let nameParts = trimmedName.split(/\s+/);
  let formattedParts = [];
  for (let i = 0; i < nameParts.length; i++) {
    let word = nameParts[i];
    let formattedWord = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    formattedParts.push(formattedWord);
  }
  return formattedParts.join(' ');
}

/**
 * Checks if both password fields match and are not empty.
 * @returns {boolean}
 */
function doPasswordsMatch() {
  if (!signinPasswordInput || !signinPasswordCheckInput) return false;
  if (signinPasswordInput.value !== signinPasswordCheckInput.value) return false;
  if (signinPasswordInput.value.length === 0) return false;
  return true;
}

/**
 * Asynchronously checks user credentials against the database.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {Promise<boolean>}
 */
async function checkUserCredentials(email, password) {
  if (!isValidEmail(email)) return false;
  if (password.length <= 3) return false;
  const users = await fetchUsers();
  return findMatchingUser(users, email, password);
}

/**
 * Finds a matching user in the users object.
 * @param {Object} users - The users object.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @returns {boolean}
 */
function findMatchingUser(users, email, password) {
  const userValues = Object.values(users);
  for (let i = 0; i < userValues.length; i++) {
    if (userValues[i].email === email && userValues[i].password === password) {
      let userFullName = userValues[i].name
      return {state: true, userFullName};
    }
  }
  return false;
}

/**
 * Asynchronously checks if an email is already registered.
 * @param {string} email - The email to check.
 * @returns {Promise<boolean>}
 */
async function emailExists(email) {
  const users = await fetchUsers();
  const userValues = Object.values(users);
  for (let i = 0; i < userValues.length; i++) {
    if (userValues[i].email === email) return true;
  }
  return false;
}

/**
 * Displays an error indicating the email is already in use.
 */
function showEmailExistsError() {
  showInputError(signinEmailInput, "Email already in use.");
}

/**
 * Handles the login form submission, validating input and processing authentication.
 * @param {Event} event - The form submission event.
 */
async function handleLogin(event) {
  event.preventDefault();
  clearLoginError();
  const email = userNameInput.value;
  const password = userPasswordInput.value;


  if (!isValidLoginInput(email, password)) return handleLoginError();

  let {state, userFullName} = await checkUserCredentials(email, password);
  
  if (state) {
    setUserIsLoggedIn(email, password, userFullName);
    return handleLoginSuccess()
  } else {
    handleLoginError();
  }
}

/** Returns true if email and password are valid. */
function isValidLoginInput(email, password) {
  return isValidEmail(email) && password.length > 3;
}

/** Handles login error UI updates. */
function handleLoginError() {
  showLoginErrorBothRed("Check your email and password. Please try again.");
  userPasswordInput.value = "";
  userNameInput.value = "";
  updatePwIcons();
}

/** Handles successful login UI updates. */
function handleLoginSuccess() {
  userPasswordInput.value = "";
  userNameInput.value = "";
  clearLoginError();
  updatePwIcons();
  window.location = "./summary.html";
}

/**
 * Validates the sign-in (registration) form and displays corresponding errors.
 */
function validateSigninForm() {
  let nameValid = isValidFullName(signinNameInput.value);
  let emailValid = isValidEmail(signinEmailInput.value.trim());
  let passwordValid = signinPasswordInput.value.length > 3;
  let passwordMatch = doPasswordsMatch();
  let checkboxChecked = signinCheckbox.checked;
  showInputErrorIfInvalid(signinNameInput, nameValid, "Please enter your first and last name.");
  showInputErrorIfInvalid(signinEmailInput, emailValid, "Please enter a valid email address.");
  showInputErrorIfInvalid(signinPasswordInput, passwordValid, "Please enter at least 4 characters.");
  showInputErrorIfInvalid(signinPasswordCheckInput, passwordMatch, "The passwords did not match.");
  let disabled = !(nameValid && emailValid && passwordValid && passwordMatch && checkboxChecked);
  setSignupBtnState(disabled);
}

/**
 * Shows or clears input error based on validation state.
 * @param {HTMLInputElement} input - The input element.
 * @param {boolean} isValid - Whether the input is valid.
 * @param {string} msg - The error message to display if invalid.
 */
function showInputErrorIfInvalid(input, isValid, msg) {
  if (!input) return;
  if (!isValid && input.value.length > 0) showInputError(input, msg);
  else clearInputError(input);
}