let btn = document.querySelector(".fa-eye");
let inputSenha = document.querySelector("#senha");
let msgError = document.querySelector("#msgError");

btn.addEventListener("click", () => {
  if (inputSenha.getAttribute("type") === "password") {
    inputSenha.setAttribute("type", "text");
  } else {
    inputSenha.setAttribute("type", "password");
  }
});

function showMessage(message) {
  msgError.style.display = "block";
  msgError.innerHTML = message;
}

function hideErrorMessage() {
  msgError.style.display = "none";
  msgError.innerHTML = "";
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function entrar() {
  console.log("Tentativa de login iniciada.");
  hideErrorMessage();
  showLoading();

  if (!usuario.value || !senha.value) {
    showMessage("Preencha todos os campos para poder logar.");
    hideLoading();
    return;
  }

  const email = usuario.value;
  const password = senha.value;

  if (!isValidEmail(email)) {
    showMessage("Formato de e-mail inválido.");
    hideLoading();
    return;
  }

  fetch(`${window.location.protocol}//${window.location.hostname}:8080/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      password: password,
    }),
  })
    .then(async (response) => {
      const data = await response.json();
      showMessage(data.message);
      if (data.userId) {
        await delay(2000)
        localStorage.setItem("userId", data.userId);
        window.location.href = "CPF.html";
      }
    })
    .catch((error) => alert(error));
}

const btnEntrar = document.querySelector("#btnEntrar");
if (btnEntrar) {
  btnEntrar.addEventListener("click", entrar);
}

function register() {
  window.location.href = "pages/register/register.html";
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}