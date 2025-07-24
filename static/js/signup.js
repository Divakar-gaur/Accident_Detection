document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector(".needs-validation");
    const emailInput = document.getElementById("useremail");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.querySelectorAll("#password-input")[0];
    const confirmPasswordInput = document.querySelectorAll("#password-input")[1];

    const passLength = document.getElementById("pass-length");
    const passLower = document.getElementById("pass-lower");
    const passUpper = document.getElementById("pass-upper");
    const passNumber = document.getElementById("pass-number");

    // Helper function to validate password rules
    function validatePassword(password) {
        const validations = {
            length: password.length >= 8,
            lower: /[a-z]/.test(password),
            upper: /[A-Z]/.test(password),
            number: /[0-9]/.test(password),
        };

        passLength.classList.toggle("valid", validations.length);
        passLength.classList.toggle("invalid", !validations.length);

        passLower.classList.toggle("valid", validations.lower);
        passLower.classList.toggle("invalid", !validations.lower);

        passUpper.classList.toggle("valid", validations.upper);
        passUpper.classList.toggle("invalid", !validations.upper);

        passNumber.classList.toggle("valid", validations.number);
        passNumber.classList.toggle("invalid", !validations.number);

        return Object.values(validations).every(Boolean);
    }

    // Password input event listener
    passwordInput.addEventListener("input", function () {
        validatePassword(passwordInput.value);
    });

    // Form submission event
    form.addEventListener("submit", function (e) {
        let valid = true;

        if (!emailInput.value) {
            emailInput.classList.add("is-invalid");
            valid = false;
        } else {
            emailInput.classList.remove("is-invalid");
        }

        if (!usernameInput.value) {
            usernameInput.classList.add("is-invalid");
            valid = false;
        } else {
            usernameInput.classList.remove("is-invalid");
        }

        if (!validatePassword(passwordInput.value)) {
            passwordInput.classList.add("is-invalid");
            valid = false;
        } else {
            passwordInput.classList.remove("is-invalid");
        }

        if (confirmPasswordInput.value !== passwordInput.value || !confirmPasswordInput.value) {
            confirmPasswordInput.classList.add("is-invalid");
            valid = false;
        } else {
            confirmPasswordInput.classList.remove("is-invalid");
        }

        if (!valid) {
            e.preventDefault();
            e.stopPropagation();
        }
    });
});