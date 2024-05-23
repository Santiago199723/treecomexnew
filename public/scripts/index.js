let usuario = document.getElementsByName("session[email]")[0];
let senha = document.getElementsByName("session[password]")[0];

function showMessage(message) {
  let msg = document.querySelector(".alert-info");
  msg.style.display = "block";
  msg.innerHTML = message;
}

function showErrorMessage(message) {
  let msgError = document.querySelector(".error");
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
  hideErrorMessage();
  showLoading();

  if (!usuario.value || !senha.value) {
    showMessage("Preencha todos os campos para poder logar.");
    hideLoading();
    return;
  }

  const email = usuario.value;
  const password = senha.value;

  if (usuario.toLowerCase() === "admin") {
    window.location.href = "/admin/login.html";
    return;
  }

  if (usuario.toLowerCase() === "direcao") {
    window.location.href = "/hm/login.html";
    return;
  }

  if (!isValidEmail(email)) {
    showErrorMessage("Formato de e-mail inválido.");
    hideLoading();
    return;
  }

  fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      password: password,
    }),
  }).then(async (response) => {
    const data = await response.json();
    if (!response.ok) {
      showErrorMessage(data.message);
    } else {
      showMessage(data.message);
      await delay(2000);
      const encodedCompany = btoa(JSON.stringify(data.company));
      localStorage.setItem("company", encodedCompany);
      if (data.master) {
        localStorage.setItem("__sess_admin__", "true");
      }

      window.location.href = "/botoesetapas.html";
    }
  });
}

const sel = document.getElementsByName("commit");
if (sel.length > 0) {
  sel[0].addEventListener("click", entrar);
}

document
  .getElementById("reset-password")
  .addEventListener("click", async function (e) {
    e.preventDefault(); // Impede o comportamento padrão do link

    // Recupere o e-mail do usuário
    const usuario = document.getElementById("usuario").value.trim();
    if (!usuario)
      return alert(
        "Digite um endereço de e-mail antes de solicitar uma alteração de senha"
      );

    // Use a funcionalidade do Firebase para enviar um e-mail de redefinição de senha
    const response = await fetch("/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: usuario,
      }),
    });

    const data = await response.json();
    alert(data.message);
  });
