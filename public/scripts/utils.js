let companyData;

const userId = localStorage.getItem("userId");
const company = localStorage.getItem("company")
  ? atob(localStorage.getItem("company"))
  : "";
const processId = localStorage.getItem("processId");
if (company) {
  companyData = JSON.parse(company);
}

class UserType {
  static ADMIN = "admin";
  static NORMAL = "normal";
  static MASTER = "master";
  static FINANCIAL = "financial";
}

async function checkSession() {
  const response = await fetch("/check-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  return response.ok;
}

async function getFileData(fileId) {
  const params = new URLSearchParams({ id: fileId });

  const response = await fetch(`/file?${params}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
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

async function refreshCompanyData() {
  if (companyData) {
    const params = new URLSearchParams({
      unique: companyData.cnpj,
    });

    const response = await fetch(`/company/data?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      companyData = data;
      localStorage.setItem("company", btoa(JSON.stringify(data)));
      showCompanyData();
    }
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
  "SÓCIO RG": 1,
  "SÓCIO CPF": 2,
  "SÓCIO CNH": 3,
  "SÓCIO COMPROVANTE DE ENDEREÇO": 4,
  "SÓCIO IR": 5,
  "SÓCIO CERTIFICADO DIGITAL": 6,
  "CONTRATO COM O CONTADOR": 7,
  "CONTRATO DA SALA (EM NOME DA EMPRESA)": 8,
  "CERTIFICADO DIGITAL DA EMPRESA": 9,
  "DADOS BANCÁRIOS DA EMPRESA": 10,
  "CONTA DE ENERGIA (EM NOME DA EMPRESA)": 11,
  "CONTA DE INTERNET / TELEFONE": 12,
  "CONTRATO DO ARMAZÉM LOGÍSTICO": 13,
  "NOTA FISCAL DOS MÓVEIS DA SALA": 14,
  "PAPEL TIMBRADO DA EMPRESA": 15,
  "DADOS DE ACESSO AO SITE E E-MAILS": 16,
  "EMPRESA CONTRATO SOCIAL": 17,
  "EMPRESA CARTÃO DE CNPJ": 18,
  "EMPRESA INSCRIÇÃO ESTADUAL": 19,
  "EMPRESA CONTA GRÁFICA": 20,
  "EMPRESA RADAR ILIMITADO": 21,
  "CONTADOR PROCURAÇÃO PF": 22,
  "CONTADOR PROCURAÇÃO PJ": 23,
  "CONTRATO CRÉDITO PRECATÓRIO": 24,
  "CONTRATO EXONERAÇÃO DE PROCESSOS": 25,
  "ADVOGADO PROCURAÇÃO EXONERAÇÃO": 26,
  "ADVOGADO PROCURAÇÃO SEFAZ": 27,
  "DESPACHANTE_1 PROCURAÇÃO": 28,
  "DESPACHANTE_2 PROCURAÇÃO": 29,
  "CONTRATO DE LOGÍSTICA_1": 30,
  "CONTRATO DE LOGÍSTICA_2": 31,
  "CONTRATO MAINO": 32,
  "CONTRATO TCX": 33,
  "CATÁLOGO DE PRODUTO": 34,
  "TROCA DE E-MAIL": 35,
  'NUMERÁRIO': 36,
  "PROFORMA INVOICE": 37,
  'PACKLIST': 38,
  "CERTIFICADO DE ORIGEM": 39,
  "LI DEFERIDA (SE FOR PRÉ EMBARQUE)": 40,
  "COMERCIAL INVOICE": 41,
  "BILL OF LADING (BL)": 42,
  "CE MERCANTE": 43,
  "DECLARAÇÃO DE IMPORTAÇÃO (DI)": 44,
  "XML (DI E NOTA ENTRADA)": 45,
  "COMPROVANTE DE IMPORTAÇÃO (CI)": 46,
  "PLANILHA CUSTO OPERACIONAL": 47,
  "PLANILHA MASTER": 48,
  "NOTA FISCAL ENTRADA": 49,
  "EXTRATO E FATURA LIB BL": 50,
  "COMPR PAGAMENTO LIB BL": 51,
  "EXTRATO E FATURA ARMAZÉM": 52,
  "COMPR PAGAMENTO ARMAZÉM": 53,
  "EXTRATO E FATURA AFRMM": 54,
  "COMPR PAGAMENTO AFRMM": 55,
  "EXTRATO E FATURA GNRE": 56,
  "COMPR PAGAMENTO GNRE": 57,
  "EXTRATO E FATURA ADUANEIRO": 58,
  "COMPR PAGAMENTO ADUANEIRO": 59,
  "EXTRATO SERASA": 60,
  "COMPR PAGAMENTO SERASA": 61,
  "NOTA FISCAL SAIDA": 62,
  "PAGAMENTO NOTA FISCAL": 63,
  "RECIBO DEVOLUÇÃO CONTAINER": 64,
  "TERMO DEVOLUÇÃO DE CONTAINER_1": 65,
  "TERMO DEVOLUÇÃO DE CONTAINER_2": 66,
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
