// src/pages/login/login.js
import { ROUTES, autenticar } from '/src/apiServices/authService.js';

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.querySelector("#loginForm");
    const emailInput = document.querySelector("#usu_email");
    const senhaInput = document.querySelector("#usu_senha");
    const togglePasswordBtn = document.querySelector("#togglePassword");
    const eyeIcon = document.querySelector("#eyeIcon");
    const btnSubmit = document.querySelector("#btnSubmit");
    const btnText = document.querySelector("#btnText");
    const btnSpinner = document.querySelector("#btnSpinner");
    const loginAlert = document.querySelector("#loginAlert");

    // Alternar visibilidade da senha
    if (togglePasswordBtn && senhaInput && eyeIcon) {
        togglePasswordBtn.addEventListener("click", () => {
            const isPassword = senhaInput.type === "password";
            senhaInput.type = isPassword ? "text" : "password";
            eyeIcon.className = isPassword ? "bi bi-eye-slash" : "bi bi-eye";
        });
    }

    // Validação e Submissão do formulário
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            loginAlert.classList.add("d-none");
            loginForm.classList.remove("was-validated");

            const email = emailInput.value.trim();
            const senha = senhaInput.value.trim();

            if (!email || !senha || !emailInput.validity.valid) {
                loginForm.classList.add("was-validated");
                loginAlert.textContent = "Preencha todos os campos obrigatórios para continuar.";
                loginAlert.classList.remove("d-none");
                return;
            }

            // Estado de carregamento
            btnSubmit.disabled = true;
            btnText.textContent = "Autenticando...";
            btnSpinner.classList.remove("d-none");

            try {
                await autenticar({ email, senha });
                window.location.assign(ROUTES.HOME);
            } catch (erro) {
                loginAlert.textContent = 'Não foi possível iniciar a demonstração. Confira os campos e tente novamente.';
                loginAlert.classList.remove('d-none');
                console.error('[Login mock]', erro);
            } finally {
                btnSubmit.disabled = false;
                btnText.textContent = 'Entrar';
                btnSpinner.classList.add('d-none');
            }
        });
    }
});