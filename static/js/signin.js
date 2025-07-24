document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password-input");

    form.addEventListener("submit", function (e) {
        let valid = true;

        // Validate username
        if (!usernameInput.value.trim()) {
            usernameInput.classList.add("is-invalid");
            valid = false;
        } else {
            usernameInput.classList.remove("is-invalid");
        }

        // Validate password
        if (!passwordInput.value.trim()) {
            passwordInput.classList.add("is-invalid");
            valid = false;
        } else {
            passwordInput.classList.remove("is-invalid");
        }

        if (!valid) {
            e.preventDefault(); // Stop form submission
        }
    });

    // Toggle password visibility
    const toggleBtn = document.getElementById("password-addon");
    toggleBtn.addEventListener("click", function () {
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            toggleBtn.innerHTML = '<i class="ri-eye-off-fill align-middle"></i>';
        } else {
            passwordInput.type = "password";
            toggleBtn.innerHTML = '<i class="ri-eye-fill align-middle"></i>';
        }
    });
});