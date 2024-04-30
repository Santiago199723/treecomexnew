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

    const params = new URLSearchParams({ unique: code });

    fetch(
      `${window.location.protocol}//${window.location.hostname}/company-data?${params}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      },
    ).then(async (response) => {
      await delay(2000);
      const data = await response.json();
      if (response.ok) {
        document.getElementById("result").innerHTML = "Verificado com sucesso!";
        await delay(2000);
        localStorage.setItem("company", JSON.stringify(data));
        window.location.href = "botoesetapas.html";
      } else {
        document.getElementById("result").innerHTML = data.message;
        await delay(2000);
      }
    });
  });

document.getElementById("noCadastro").addEventListener("click", function () {
  window.location.href = "cadastro.html";
});
