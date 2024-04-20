const userId = localStorage.getItem("userId");
const company = localStorage.getItem("company");

const companyData = JSON.parse(company);

async function checkSession() {
  const response = await fetch(
    `${window.location.protocol}//${window.location.hostname}/check-session`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    },
  );

  return response.ok;
}

async function refreshCompanyData() {
  const params = new URLSearchParams({
    unique: companyData.cpf ? companyData.cpf : companyData.cnpj,
  });

  fetch(
    `${window.location.protocol}//${window.location.hostname}/company-data?${params}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    },
  )
    .then(async (response) => {
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("company", JSON.stringify(data));
      }
    })
    .catch((error) => alert(error));
}

function showCompanyData() {
  if (companyData) {
    document.getElementById("company-name").innerText =
      companyData.companyName.toUpperCase();
    document.getElementById("company-type").innerText = (
      companyData.matriz ? "matriz" : "filial"
    ).toUpperCase();
    document.getElementById("company-state").innerText =
      companyData.country.toUpperCase();
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
