let offsetX, offsetY;
const buttons = document.querySelectorAll(".neumorphic");
const csn = Number(window.location.pathname.match(/[0-9]+/)[0]);

function handleFileUpload(btnIndex) {
  const fileInput = document.querySelector(".file-input");

  if (!fileInput.files || fileInput.files.length === 0) return;

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = function (event) {
    const fileBlob = event.target.result.split(",")[1];

    fetch(
      `${window.location.protocol}//${window.location.hostname}/upload-file`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: file.name,
          blob: fileBlob,
          mimeType: file.type,
        }),
      },
    ).then(async (response) => {
      const data = await response.json();

      if (response.ok) {
        const obj = {
          fileId: data.fileId,
          optionType: getOptionType(btnIndex),
          stageNumber: csn,
          processId: csn !== 1 ? processId : undefined,
        };

        await fetch(
          `${window.location.protocol}//${window.location.hostname}/sniff`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              action: "uploaded_file",
              data: obj,
              company: companyData.cpf ? companyData.cpf : companyData.cnpj,
            }),
            credentials: "include",
          },
        );
      }

      alert(data.message);
      showSubmenuData(btnIndex);
      await refreshButtons();
    });
  };

  reader.readAsDataURL(file);
}

function handleFileRemove(fileId, btnIndex) {
  const resp = confirm("Tem certeza de que deseja excluir o arquivo?");
  if (resp === true) {
    const obj = {
      fileId: fileId,
      optionType: getOptionType(btnIndex),
      stageNumber: csn,
      processId: csn !== 1 ? processId : undefined,
    };

    fetch(`${window.location.protocol}//${window.location.hostname}/sniff`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "removed_file",
        data: obj,
        company: companyData.cpf ? companyData.cpf : companyData.cnpj,
      }),
      credentials: "include",
    }).then((response) => {
      if (response.ok) {
        alert("Arquivo excluido com sucesso");
        showSubmenuData(btnIndex);
      }
    });
  } else {
    alert("Operação cancelada!");
  }
}

function showSubmenu(btnIndex) {
  const submenus = document.querySelectorAll(".submenu");
  if (submenus[0].style != "flex") {
    submenus[0].style.display = "flex";
  }

  showSubmenuData(btnIndex);
}

function showSubmenuData(btnIndex) {
  const submenu = document.querySelector("#submenu_botao");
  const fileDetailsElements = submenu.querySelectorAll(".file-details");
  fileDetailsElements.forEach((element) => {
    element.remove();
  });

  let trash = submenu.querySelector("#trash");
  let attachBtn = submenu.querySelector(".attach-file-button");
  let input = submenu.querySelector(".file-input");
  let fileName = submenu.querySelector(".file-name");

  fileName.style.display = "none";
  trash.style.display = "none";

  attachBtn.onclick = () => input.click();
  input.onchange = () => handleFileUpload(btnIndex);

  const obj = {
    company: companyData.cpf ? companyData.cpf : companyData.cnpj,
    stage: csn,
    option: getOptionType(btnIndex),
    processId: csn !== 1 ? processId : undefined,
  };

  const params = new URLSearchParams(obj);

  fetch(
    `${window.location.protocol}//${window.location.hostname}/stage?${params}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    },
  ).then(async (response) => {
    const data = await response.json();
    if (response.ok && data.length !== 0) {
      const attachedFiles = [];
      const removedFiles = [];

      data.forEach((value) => {
        if (value.type === 1) {
          attachedFiles.push(value);
        } else {
          removedFiles.push(value);
        }
      });

      attachedFiles.sort(
        (a, b) => new Date(b.attachedDate) - new Date(a.attachedDate),
      );
      removedFiles.sort(
        (a, b) => new Date(b.removedDate) - new Date(a.removedDate),
      );

      const sortedData = removedFiles.concat(attachedFiles);
      sortedData.sort(
        (a, b) =>
          new Date(b.attachedDate || b.removedDate) -
          new Date(a.attachedDate || a.removedDate),
      );

      if (sortedData[0].type === 1) {
        const file = await getFileData(sortedData[0].fileId);
        fileName.innerText = file.name;
        fileName.onclick = () => {
          const parts = String.fromCharCode(...new Uint8Array(file.blob.data));

          const blob = new Blob([atob(parts)], { type: file.mimeType });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = file.name;
          a.click();
          URL.revokeObjectURL(url);
        };

        trash.onclick = () => handleFileRemove(file.id, btnIndex);
        fileName.style.display = "flex";
        trash.style.display = "flex";
      }

      sortedData.forEach((value) => {
        const fileDetails = document.createElement("div");
        fileDetails.classList.add("file-details");

        const dateKey = value.type === 1 ? "attachedDate" : "removedDate";
        const actionKey = value.type === 1 ? "attachedBy" : "removedBy";

        fileDetails.innerHTML = `
            <p>Data de ${
              value.type === 1 ? "anexo" : "exclusão"
            }: <span class="submenu-span-red">${formatDate(
              value[dateKey],
            )}</span></p>
            <span style="width: 10px"></span>
            <p>${
              value.type === 1 ? "Anexado por" : "Removido por"
            }: <span class="submenu-span-red">${value[actionKey]}</span></p>
          `;

        submenu.appendChild(fileDetails);
      });
    }
  });
}
window.onload = async function () {
  await refreshCompanyData();
  showCompanyData();
  await refreshButtons();

  if (csn === 1) {
    const creationDate = new Date(companyData.createdAt);
    const currentDate = new Date();
    const diffInDays = Math.floor(
      (currentDate - creationDate) / (1000 * 60 * 60 * 24),
    );
    const daysRemaining = 45 - diffInDays;

    const remainingDaysContainer = document.querySelector(
      ".data-restante-container",
    );
    const hintTextRemaining = remainingDaysContainer.querySelector(
      "#hint-text-remaining",
    );
    const restRemainer = remainingDaysContainer.querySelector("#rest-remainer");

    hintTextRemaining.innerText = `${daysRemaining} dias`;
    restRemainer.innerText = "para terminar esta etapa";
    remainingDaysContainer.style.display = "flex";
  }

  if (csn === 2) {
    if (!processId) {
      window.location.href = "botoesetapas.html";
      return;
    } else {
      document.getElementById("current-process").innerText = "Processo:";
      document.getElementById("current-process-number").innerText = processId;
      document.querySelector(".current-process-container").style.display =
        "flex";
    }
  }

  buttons.forEach((button, index) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const submenuIndex = index + 1;
      showSubmenu(submenuIndex);
    });
  });
};

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

async function refreshButtons() {
  buttons.forEach(async (button, index) => {
    const submenuIndex = index + 1;

    const params = new URLSearchParams({
      company: companyData.cpf ? companyData.cpf : companyData.cnpj,
      stage: csn,
      option: getOptionType(submenuIndex),
      processId: csn !== 1 ? processId : undefined,
    });

    const s = await fetch(
      `${window.location.protocol}//${window.location.hostname}/stage?${params}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      },
    );

    if (s.ok) {
      const data = await s.json();
      if (data.length !== 0) {
        button.style.boxShadow =
          "-0.5rem -0.5rem 1rem hsl(183, 72%, 54%), 0.5rem 0.5rem 1rem hsl(0 0% 50% / 0.5)";
      } else {
        button.style.boxShadow =
          "-0.5rem -0.5rem 1rem hsl(0 0% 100% / 0.75), 0.5rem 0.5rem 1rem hsl(0 0% 50% / 0.5)";
      }
    }
  });
}
