const userId = localStorage.getItem("userId");
const company = localStorage.getItem("company");
const processId = localStorage.getItem("processId");
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

  const response = await fetch(
    `${window.location.protocol}//${window.location.hostname}/company-data?${params}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    },
  );

  if (response.ok) {
    const data = await response.json();
    localStorage.setItem("company", JSON.stringify(data));
  }
}

async function getFileData(fileId) {
  const params = new URLSearchParams({ id: fileId });

  const response = await fetch(
    `${window.location.protocol}//${window.location.hostname}/file?${params}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    },
  );
  if (response.ok) {
    const data = await response.json();
    return data.file;
  }

  return {};
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

function formatDate(date) {
  const formattedDate = new Date(date).toLocaleString("pt-BR");

  return formattedDate;
}

const etapas = {
  "DOCUMENTOS PESSOAIS DO SÓCIO": 1,
  "CERTIFICADO DIGITAL DO SÓCIO": 2,
  "CONTRATAÇÃO DO CONTADOR": 3,
  "CONTRATAÇÃO DE SALA": 4,
  "E-CNPJ A1": 5,
  "ALTERAR CONTA DE ENERGIA PARA NOME DA EMPRESA": 6,
  "SOLICITAR INTERNET/TELEFONE": 7,
  "CONTRATAÇÃO DE ARMAZÉM LOGÍSTICO": 8,
  "COMPRA DE MÓVEIS E ELETRÔNICOS": 9,
  "ADEQUAÇÃO VISUAL DA SALA": 10,
  "CONTRATAÇÃO DE HOSPEDAGEM E DOMÍNIO": 11,
  "CRIAÇÃO DE EMAILS": 12,
  "CRIAÇÃO DE REDE SOCIAIS": 13,
  "DOCUMENTOS DA EMPRESA CONTRATO SOCIAL, CNPJ E IE": 14,
  "HABILITAÇÃO DE RADAR": 15,
  "CONTA GRÁFICA": 16,
  "CONTRATAÇÃO ADM": 17,
  "ABERTURA DE CONTA PJ BRADESCO, SANTANDER, ETC": 18,
  "CONTRATO COM EMPRESAS DE REPRESENTAÇÃO": 19,
  "CONTRATO DRA CLAUDIA": 20,
  "CONTRATO OPERADOR LOGÍSTICO": 21,
  "CONTRATO COM ARMADOR": 22,
  "CONTRATO COM SERASA": 23,
  "CONTRATO COM MAINO": 24,
  "CONTRATO COM A PROSEFTUR": 25,
  "CONTRATO COM TREECOMEX": 26,
};

function getOptionType(x) {
  for (let key in etapas) {
    if (etapas[key] == x) {
      return key;
    }
  }

  return null;
}

function routeTo(pathName) {
  window.location.href = pathName;
}

function logout() {
  localStorage.clear();
  window.location.href = "/index.html";
}
