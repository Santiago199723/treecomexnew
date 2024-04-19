document.addEventListener('DOMContentLoaded', function () {
  let btn = document.querySelector('.fa-eye');
  let inputSenha = document.querySelector('#senha');
  let msgError = document.querySelector('#msgError');

  btn.addEventListener('click', () => {
    if (inputSenha.getAttribute('type') === 'password') {
      inputSenha.setAttribute('type', 'text');
    } else {
      inputSenha.setAttribute('type', 'password');
    }
  });

  function showErrorMessage(message) {
    msgError.style.display = 'block';
    msgError.innerHTML = message;
  }

  function hideErrorMessage() {
    msgError.style.display = 'none';
    msgError.innerHTML = '';
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
      showErrorMessage('Preencha todos os campos para poder logar.');
      hideLoading();
      return;
    }

    const email = usuario.value;
    const password = senha.value;

    if (!isValidEmail(email)) {
      showErrorMessage('Formato de e-mail inválido.');
      hideLoading();
      return;
    }

    console.log("Email:", email);

    firebase.auth().signInWithEmailAndPassword(email, password)
      .then(() => {
        console.log("Login bem-sucedido.");
        hideLoading();
        window.location.href = "administracao.html";
      })
      .catch(error => {
        console.error("Erro durante o login:", error);
        hideLoading();
        showErrorMessage(getErrorMessage(error));
      });
  }

  function getErrorMessage(error) {
    if (error.code === "auth/user-not-found") {
      return "Usuário não encontrado";
    } else if (error.code === "auth/invalid-login-credentials") {
      return "Usuário não tem cadastro ou e-mail e senha incorretos.";
    } else if (error.code === "auth/invalid-email") {
      return "Endereço de e-mail inválido";
    }
    return error.message;
  }

  function register() {
    window.location.href = "pages/register/register.html";
  }

  const btnEntrar = document.querySelector('#btnEntrar');
  if (btnEntrar) {
    btnEntrar.addEventListener('click', entrar);
  }
});
