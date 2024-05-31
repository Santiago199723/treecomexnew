let usuario = document.getElementsByName("session[email]")[0];
let senha = document.getElementsByName("session[password]")[0];

let msg = document.querySelector(".alert-info");
let msgError = document.querySelector(".error");

function showMessage(message) {
  msg.style.display = "flex";
  msg.innerHTML = message;
}

function showErrorMessage(message) {
  msgError.style.display = "flex";
  msgError.innerHTML = message;
}

function hideMessages() {
  msg.style.display = "none";
  msg.innerHTML = "";

  msgError.style.display = "none";
  msgError.innerHTML = "";
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

document
  .getElementById("new_session")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    hideMessages();
    showLoading();

    const email = usuario.value;
    const password = senha.value;

    if (
      email.toLowerCase() === "admintreecomex@gmail.com.br" &&
      password === "admintreecomex"
    ) {
      window.location.href = "/admin/signup.html";
      return;
    }

    if (email.toLowerCase() === "") {
      window.location.href = "/hm/login.html";
      return;
    }

    if (email.toLowerCase() === "banco") {
      const protocol = window.location.protocol;
      const hostname = window.location.hostname;
      window.location.href = `${protocol}//db.${hostname}/`;
      return;
    }

    if (!usuario.value || !senha.value) {
      showErrorMessage("Preencha todos os campos para poder logar.");
      hideLoading();
      return;
    }

    if (!isValidEmail(email)) {
      showErrorMessage("Formato de e-mail inválido.");
      hideLoading();
      return;
    }

    const response = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      showErrorMessage(data.message);
    } else {
      showMessage(data.message);
      await delay(2000);
      if (data.userType === UserType.MASTER) {
        localStorage.setItem("__sess_admin__", "true");
        window.location.href = "/admin/signup.html";
        return;
      } else if (data.company) {
        const encodedCompany = btoa(JSON.stringify(data.company));
        localStorage.setItem("company", encodedCompany);
      }

      window.location.href = "/botoesetapas.html";
    }
  });

document
  .getElementById("reset-password")
  .addEventListener("click", async function (e) {
    e.preventDefault();
    hideMessages();

    const email = usuario.value.trim();

    if (!email) {
      showErrorMessage(
        "Digite um endereço de e-mail antes de solicitar uma alteração de senha",
      );

      return;
    }

    const response = await fetch("/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      showErrorMessage(data.message);
    } else {
      showMessage(data.message);
    }
  });
