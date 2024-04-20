let offsetX, offsetY;
const userId = localStorage.getItem("userId");
const company = localStorage.getItem("company");
const csn = Number(window.location.pathname.match(/[0-9]+/)[0]);

function handleFileUpload(j, code) {
  const fileInput = document.querySelector(".file-input");

  if (!fileInput.files || fileInput.files.length === 0) return;

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = function (event) {
    const fileBlob = event.target.result.split(",")[1];
    const code = companyData.cpf ? companyData.cpf : companyData.cnpj
    const payload = {
      company: code,
      optionType: getOptionType(j),
      stageNumber: csn,
      fileName: file.name,
      fileBlob: fileBlob,
      mimeType: file.type,
      uploadBy: userId,
    };

    fetch(`${window.location.protocol}//${window.location.hostname}/upload-file`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then(async (response) => {
        const data = await response.json();
        alert(data.message);
      })
      .catch((error) => alert(error));
  };

  reader.readAsDataURL(file);
}

function showSubmenu(j) {
  const submenus = document.querySelectorAll(".submenu");
  if (submenus[0].style != "flex") {
    submenus[0].style.display = "flex";
  }

  showSubmenuData(j);
}

// Função para carregar arquivos anexados ao recarregar a página
function showSubmenuData(j) {
  const submenu = document.querySelector("#submenu_botao");
  const containerData = submenu.querySelector(".container-data");

  let trash = submenu.querySelector("#trash");
  let attachBtn = submenu.querySelector(".attach-file-button");
  let input = submenu.querySelector(".file-input");
  let fileName = submenu.querySelector(".file-name");

  let uploadTime = containerData.querySelector(".upload-date");
  let uploadBy = containerData.querySelector(".uploaded-by");
  let deletedBy = containerData.querySelector(".deleted-by");
  let deletionDate = containerData.querySelector(".deletion-date");

  trash.style.display = "none";

  uploadTime.innerText = "-";
  uploadBy.innerText = "-";
  deletedBy.innerText = "-";
  deletionDate.innerText = "-";

  const companyData = JSON.parse(company);
  const code = companyData.cpf ? companyData.cpf : companyData.cnpj
  
  attachBtn.onclick = () => input.click();
  input.onchange = () => handleFileUpload(j);

  fetch(`${window.location.protocol}//${window.location.hostname}/file-list`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      company: code,
      stageNumber: csn,
      optionType: getOptionType(j),
    }),
  })
    .then(async (response) => {
      const data = await response.json();
      if (response.ok) {
        data.files.forEach((resp) => {
          fileName.innerText = resp.fileName;

          fileName.style.display = "flex";
        })
      }
    })
    .catch((error) => alert(error));
}

function changeButtonColor(button) {
  if (fileIndex !== -1) {
    button.style.boxShadow =
      "-0.5rem -0.5rem 1rem hsl(183, 72%, 54%), 0.5rem 0.5rem 1rem hsl(0 0% 50% / 0.5)";
  } else {
    button.style.boxShadow =
      "-0.5rem -0.5rem 1rem hsl(0 0% 100% / 0.75), 0.5rem 0.5rem 1rem hsl(0 0% 50% / 0.5)";
  }
}

window.onload = function () {
  if (!company) {
    window.location.href = "CPF.html";
    return;
  }

  const processID = localStorage.getItem("process-id");
  if (csn === 2 && !processID) {
    window.location.href = "botoesetapas.html";
    return;
  } else if (csn === 2) {
    document.getElementById("current-process").innerText = "Processo:";
    document.getElementById("current-process-number").innerText = processID;
    document.querySelector(".current-process-container").style.display = "flex";
  }

  fetchCompanyData().then(() => showCompanyData());

  if (csn === 0) {
    const creationDate = new Date(data.dataCriacao);
    const currentDate = new Date();
    const diff = currentDate - creationDate;
    const daysPassed = 45 - Math.floor(diff / (1000 * 60 * 60 * 24));
    const remainingDays = document.querySelector(".data-restante-container");

    remainingDays.querySelector(
      "#hint-text-remaining"
    ).innerText = `${daysPassed.toString()} dias`;
    remainingDays.querySelector("#rest-remainer").innerText =
      "para terminar esta etapa";
    remainingDays.style.display = "flex";
  }

  const buttons = document.querySelectorAll(".neumorphic");

  buttons.forEach((button, index) => {
    setInterval(() => {
      changeButtonColor(button);
    }, 1000);

    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const submenuIndex = index + 1;
      showSubmenu(submenuIndex);
    });
  });
};

function removeFile(identifier) {
  const resp = confirm("Tem certeza de que deseja excluir o arquivo?");
  if (resp === true) {
  } else {
    alert("Operação cancelada!");
  }
}

let draggable = document.querySelector("#submenu_botao");

function drag(event) {
  draggable.style.left = event.clientX - offsetX + "px";
  draggable.style.top = event.clientY - offsetY + "px";
}

function stopDragging(event) {
  document.removeEventListener("mousemove", drag);
  document.removeEventListener("mouseup", stopDragging);
}

draggable.addEventListener("mousedown", function (event) {
  event.preventDefault();

  offsetX = event.clientX - draggable.getBoundingClientRect().left;
  offsetY = event.clientY - draggable.getBoundingClientRect().top;

  document.addEventListener("mousemove", drag);

  document.addEventListener("mouseup", stopDragging);
});

document.addEventListener("click", function (event) {
  const submenuBotao = document.querySelector("#submenu_botao");
  if (!submenuBotao.contains(event.target)) {
    submenuBotao.style.display = "none";
  }
});

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

function getFormattedDate() {
  let date = new Date();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  const hour = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  const fmt = `${day}/${month}/${year} ${hour}:${minutes}:${seconds}`;
  return fmt;
}

function routeTo(pathName) {
  window.location.href = pathName;
}
