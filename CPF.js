const userId = localStorage.getItem("userId");

document
  .getElementById("searchForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    let code = document.getElementById("dataInput").value;
    code = code.replace(/\D/g, "");

    if (code.length !== 11 && code.length !== 18) {
      document.getElementById("result").innerHTML =
        "Informe um CPF ou CNPJ válido!";
      return;
    }

    document.getElementById("result").innerHTML =
      "Aguarde, já estamos identificando..";

    fetch("http://localhost:8080/company-data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId,
        company: code,
      }),
    }).then(async (response) => {
      await delay(2000)
      const data = await response.json();
      if (response.ok) {
        document.getElementById("result").innerHTML =
        "Verificado com sucesso!";
        await delay(2000)
        localStorage.setItem("company", JSON.stringify(data));
        window.location.href = "botoesetapas.html"
      } else {
        document.getElementById("result").innerHTML = data.message;
        await delay(2000)
      }
    }).catch((error) => alert(error));
  });

document.getElementById("noCadastro").addEventListener("click", function () {
  window.location.href = "cadastro.html";
});

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

window.onload = function () {
  if (!userId) {
    window.location.href = "/";
  }
};
