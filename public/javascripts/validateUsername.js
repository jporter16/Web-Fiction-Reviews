const registerForm = document.querySelector("#register-form");
const usernameInput = document.querySelector("#username");
const usernameErrorMessage = document.querySelector("#username-error-message");

if (usernameInput && registerForm) {
  usernameInput.addEventListener("input", function () {
    const username = usernameInput.value;
    const validationResult = validateUser(username);
    updateInputFeedback(usernameInput, validationResult);
  });
  registerForm.addEventListener("submit", function (event) {
    const username = usernameInput.value;
    const validationResult = validateUser(username);

    // Update the input feedback based on the validation result
    updateInputFeedback(usernameInput, validationResult);

    // If the custom validation for the username field fails or the form doesn't pass the Bootstrap validation,
    // prevent the form from submitting
    if (!validationResult.isValid || !registerForm.checkValidity()) {
      event.preventDefault();
      event.stopPropagation();
      //   registerForm.classList.add("was-validated");
      return;
    }
  });
}

function updateInputFeedback(input, validationResult) {
  const feedbackElement = input.nextElementSibling;

  if (validationResult.isValid) {
    input.classList.add("is-valid");
    input.classList.remove("is-invalid");
    if (feedbackElement) feedbackElement.textContent = "";
  } else {
    input.classList.add("is-invalid");
    input.classList.remove("is-valid");
    if (feedbackElement) feedbackElement.textContent = validationResult.message;
  }
}

function validateUser(username) {
  const minLength = 3;
  const maxLength = 30;
  const alphanumericRegex = /^[a-z0-9]+$/i;
  const reservedWords = ["admin", "moderator"];

  let validationResult = {
    isValid: true,
    message: "",
  };

  if (username.length < minLength) {
    validationResult.isValid = false;
    validationResult.message = "Username is too short.";
  } else if (username.length > maxLength) {
    validationResult.isValid = false;
    validationResult.message = "Username is too long.";
  } else if (!alphanumericRegex.test(username)) {
    validationResult.isValid = false;
    validationResult.message =
      "Username should only include numbers and letters.";
  } else if (username.includes(" ")) {
    validationResult.isValid = false;
    validationResult.message = "Username contains spaces.";
  } else if (
    reservedWords.some((word) => username.toLowerCase().includes(word))
  ) {
    validationResult.isValid = false;
    validationResult.message = "Username contains a reserved word.";
  }

  return validationResult;
}
