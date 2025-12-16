/**
 * Handles the sign-up (registration) process on form submission.
 * @param {Event} event - The form submit event.
 */
async function handleSignup(event) {
  event.preventDefault();
  validateSigninForm();
  if (signupBtn.disabled) return;
  const name = formatFullName(signinNameInput.value);
  const email = signinEmailInput.value.trim();
  const password = signinPasswordInput.value;

  if (await emailExists(email)) {
    showEmailExistsError();
    return;
  }

  const userData = { name, email, password };
  const contactData = { name, email };
  await saveUserAndContact(userData, contactData);
  showSigninSuccessDialog();
}

/**
 * Shows the sign-in success dialog and resets form fields.
 */
function showSigninSuccessDialog() {
  if (!dialogSignin) return;
  dialogSignin.classList.remove("d_none");
  const innerBox = document.getElementById('dialog_signin_inner');
  if (innerBox) {
    innerBox.classList.remove('hide_dialog_signin');
    innerBox.classList.add('show_dialog_signin');
  }
  clearSigninInputs();
  setTimeout(function () {
    hideSigninSuccessDialog();
    showLoginAfterSignin();
  }, 1800);
}

/**
 * Hides the sign-in success dialog.
 */
function hideSigninSuccessDialog() {
  if (!dialogSignin) return;
  dialogSignin.classList.add("d_none");
  const innerBox = document.getElementById('dialog_signin_inner');
  if (innerBox) {
    innerBox.classList.remove('show_dialog_signin');
    innerBox.classList.add('hide_dialog_signin');
  }
}

/**
 * Switches from the sign-in form to the login form after successful registration.
 */
function showLoginAfterSignin() {
  const loginForm = document.getElementById("login-form");
  if (!loginForm || !signinForm || !signinContainer) return;
  loginForm.classList.remove("d_none");
  signinForm.classList.add("d_none");
  signinContainer.classList.remove("d_none");
}

/**
 * Clears all input fields in the sign-in (registration) form.
 */
function clearSigninInputs() {
  if (signinNameInput) signinNameInput.value = "";
  if (signinEmailInput) signinEmailInput.value = "";
  if (signinPasswordInput) signinPasswordInput.value = "";
  if (signinPasswordCheckInput) signinPasswordCheckInput.value = "";
  if (signinCheckbox) signinCheckbox.checked = false;
}

/**
 * Fetches all users from the database asynchronously.
 * @returns {Promise<Object>}
 */
async function fetchUsers() {
  return await getUsersFromDatabase();
}

/**
 * Saves user and contact data to the database asynchronously.
 * @param {Object} userData - The user data to save.
 * @param {Object} contactData - The contact data to save.
 * @returns {Promise<void>}
 */
async function saveUserAndContact(userData, contactData) {
  await postToDatabase('/users', userData);
  await postToDatabase('/contacts', contactData);
}

/**
 * Initializes the password icon and toggle password visibility feature.
 */
function setupPasswordToggle() {
  for (let i = 0; i < pwIcons.length; i++) {
    pwIcons[i].addEventListener('click', function () {
      if (pwInputs[i].value.length === 0) return;
      isPasswordVisible = !isPasswordVisible;
      updatePwIcons();
    });
  }
  updatePwIcons();
}

/**
 * Runs a fade-in effect for elements with the "fade_out" class.
 */
function runFadeInOut() {
  setTimeout(function () {
    const elements = document.querySelectorAll(".fade_out");
    for (let i = 0; i < elements.length; i++) {
      elements[i].classList.add("fade_in");
      elements[i].classList.remove("fade_out");
    }
  }, 1000);
}

/**
 * Runs a fade-in effect for elements with the "fade_out" class.
 */
function fadeWelcome() {
  setTimeout(function () {
    welcomeContent.classList.add("welcome_in");
  }, 1000);
}

/**
 * Sets up event listeners for the login form.
 */
function setupLoginListeners() {
  if (loginBtn) loginBtn.addEventListener('click', handleLogin);
  if (guestLoginBtn) {
    guestLoginBtn.addEventListener('click', () => {
      setUserIsLoggedIn();
      window.location = "./summary.html";
    });
  }
  if (userNameInput) userNameInput.addEventListener('input', clearLoginError);
  if (userPasswordInput) userPasswordInput.addEventListener('input', function () {
    clearLoginError();
    updatePwIcons();
  });
}

/**
 * Sets up event listeners for the sign-in (registration) form.
 */
function setupSigninListeners() {
  if (signupBtn) signupBtn.addEventListener('click', handleSignup);
  [
    signinNameInput,
    signinEmailInput,
    signinPasswordInput,
    signinPasswordCheckInput,
    signinCheckbox
  ].forEach(function (el) {
    if (el) {
      el.addEventListener('input', function () {
        validateSigninForm();
        updatePwIcons();
      });
      el.addEventListener('change', function () {
        validateSigninForm();
        updatePwIcons();
      });
    }
  });
}

/**
 * Sets up event listeners for toggling between login and sign-in forms.
 */
function setupToggleListeners() {
  if (toggleSignIn && toggleLogIn) {
    toggleSignIn.addEventListener('click', toggleFormLoginSignin);
    toggleLogIn.addEventListener('click', toggleFormLoginSignin);
  }
  /**
   * Toggles between login and sign-in forms.
   */
  function toggleFormLoginSignin() {
    const loginForm = document.getElementById("login-form");
    if (!loginForm || !signinForm || !signinContainer) return;
    const loginHidden = loginForm.classList.contains("d_none");
    if (!loginHidden) {
      loginForm.classList.add("d_none");
      signinForm.classList.remove("d_none");
      signinContainer.classList.add("d_none");
    } else {
      loginForm.classList.remove("d_none");
      signinForm.classList.add("d_none");
      signinContainer.classList.remove("d_none");
    }
  }
}

/**
 * Sets up the privacy checkbox event listener to toggle the checkbox image.
 */
function setupPrivacyCheckboxListener() {
  if (togglePrivacyCheck) {
    togglePrivacyCheck.addEventListener('click', function () {
      let btnRef = document.getElementById("signin-btn-checkbox");
      let imgRef = document.getElementById("signin-btn-checkbox-img");
      if (btnRef && imgRef) {
        imgRef.src = btnRef.checked
          ? "./assets/icons/checkbox_active.svg"
          : "./assets/icons/checkbox.svg";
      }
    });
  }
}

/**
 * Hover effect on an div box while effected only in the img inside
 * @type {HTMLElement}
 * */
function setupHoverPrivacyCheckboxListener() {
  signupBtnHover.addEventListener('mouseover', () => {
    labelHover.style.borderRadius = "50%";
    labelHover.style.background = "rgba(237, 242, 250, 1)";
  })

  signupBtnHover.addEventListener('mouseout', () => {
    labelHover.style.borderRadius = null;
    labelHover.style.background = null;
  })
}

toggleMemberLogin.addEventListener('click', () => {
  // let welcomeContent = document.querySelector('.welcome_content');
  welcomeContent.classList.remove('welcome_in');
  welcomeContent.classList.add('welcome_out');
  let loginLogo = document.querySelector('.login_logo');
  loginLogo.classList.add('slide');
  runFadeInOut();
})
