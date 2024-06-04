const nextReg = localStorage.getItem("__next_reg__");

window.onload = function () {
  if (!nextReg) {
    window.location.href = "/admin/signup.html";
  }
};

const estadosSiglas = {
  "": "",
  12: "AC",
  27: "AL",
  13: "AM",
  16: "AP",
  29: "BA",
  23: "CE",
  53: "DF",
  32: "ES",
  52: "GO",
  21: "MA",
  31: "MG",
  50: "MS",
  51: "MT",
  15: "PA",
  25: "PB",
  26: "PE",
  22: "PI",
  41: "PR",
  33: "RJ",
  24: "RN",
  11: "RO",
  14: "RR",
  43: "RS",
  42: "SC",
  28: "SE",
  35: "SP",
  17: "TO",
};

document
  .getElementById("cadastro-orion-global")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const nome = getElementVal("nome");
    const empresa = getElementVal("empresa");
    const cpf = getElementVal("cpf");
    const cnpj = getElementVal("cnpj");
    const matriz = document.querySelector("#matriz").checked;
    const estado = estadosSiglas[getElementVal("CodUf")];

    const response = await fetch("/company-register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ownerName: nome,
        companyName: empresa,
        cpf: cpf,
        cnpj: cnpj,
        country: estado,
        matriz: matriz,
        ofUser: nextReg,
      }),
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok) {
      let alertMsg = document.querySelector(".alert");
      alertMsg.innerHTML = data.message;
      alertMsg.style.display = "block";
      await delay(2000);
    } else {
      document.getElementById("cadastro-orion-global").reset();
      let msg = document.getElementById("mensagem-sucesso");
      msg.innerText = data.message;
      msg.style.display = "block";
      await delay(2000);
      localStorage.removeItem("__next_reg__");
      window.location.href = "/admin/signup.html";
    }
  });

const getElementVal = (id) => {
  return document.getElementById(id).value;
};
