let buttons;
let offsetX, offsetY;
const submenu = document.querySelector(".submenu");
const csn = Number(window.location.pathname.match(/[0-9]+/)[0]);

function handleFileUpload(btnIndex) {
  const fileInput = document.querySelector(".file-input");

  if (!fileInput.files || fileInput.files.length === 0) return;

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = function (event) {
    const fileBlob = event.target.result.split(",")[1];

    fetch("/upload-file", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: file.name,
        blob: fileBlob,
        mimeType: file.type,
      }),
    }).then(async (response) => {
      const data = await response.json();

      if (response.ok) {
        const obj = {
          fileId: data.fileId,
          optionType: getOptionType(btnIndex),
          stageNumber: csn,
          processId: csn !== 1 ? processId : undefined,
        };

        await fetch("/sniff", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "uploaded_file",
            data: obj,
            company: companyData.cnpj,
          }),
          credentials: "include",
        });
      }

      alert(data.message);
      showSubmenuData(btnIndex);
    });
  };

  reader.readAsDataURL(file);
}

function handleFileRemove(fileId, btnIndex, button) {
  const resp = confirm("Tem certeza de que deseja excluir o arquivo?");
  if (resp === true) {
    const obj = {
      fileId: fileId,
      optionType: getOptionType(btnIndex),
      stageNumber: csn,
      processId: csn !== 1 ? processId : undefined,
    };

    fetch("/sniff", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "removed_file",
        data: obj,
        company: companyData.cnpj,
      }),
      credentials: "include",
    }).then((response) => {
      if (response.ok) {
        alert("Arquivo excluido com sucesso");
        showSubmenuData(btnIndex, button);
      }
    });
  } else {
    alert("Operação cancelada!");
  }
}

function showSubmenuData(btnIndex, button) {
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

  const option = getOptionType(btnIndex);
  if (option) {
    let obj = {
      company: companyData.cnpj,
      stage: csn,
      option: option,
    };

    if (csn !== 1) obj.processId = processId;

    const params = new URLSearchParams(obj);

    fetch(`/stage?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    }).then(async (response) => {
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
            const parts = String.fromCharCode(
              ...new Uint8Array(file.blob.data),
            );

            const blob = new Blob([atob(parts)], { type: file.mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = file.name;
            a.click();
            URL.revokeObjectURL(url);
          };

          trash.onclick = () => handleFileRemove(file.id, btnIndex, button);
          fileName.style.display = "flex";
          trash.style.display = "flex";

          if (button) {
            // button.style.boxShadow = "-0.5rem -0.5rem 1rem hsl(183, 72%, 54%), 0.5rem 0.5rem 1rem hsl(0 0% 50% / 0.5)";
            const img = button.querySelector("img");
            img.style.display = "flex";
          }
        } else {
          if (button) {
            const img = button.querySelector("img");
            img.style.display = "none";
          }
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
}

window.onload = async function () {
  const response = await fetch("/user", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (response.ok) {
    const data = await response.json();
    const email = document.getElementById("email");
    email.innerHTML = data.email;
  }

  //const buttonContainer = document.querySelector(".buttons");

  //let keys;
  //if (csn == 1) {
  //keys = Object.keys(etapas).slice(0, 33);
  //} else {
  //keys = Object.keys(etapas).slice(33, 41);
  //}

  //keys.forEach((label) => {
  //const button = document.createElement("button");
  //button.setAttribute("type", "button");
  //button.classList.add("neumorphic");
  //button.style.backgroundImage = "https://ibb.co/dtGjdmK";
  //const img = document.createElement("img");
  //img.src = "https://i.ibb.co/89mwDty/clipes-de-papel-1.png";
  //img.style.width = "40px";
  //img.style.transform = "rotate(-45deg)";
  //img.style.position = "absolute";
  //img.style.right = "0";
  //img.style.display = "none";
  //const span = document.createElement("span");
  //span.textContent = label;
  //button.appendChild(img);
  //button.appendChild(span);
  //buttonContainer.appendChild(button);
  //});

  const buttons = document.querySelectorAll(".neumorphic");

  buttons.forEach((button, index) => {
    const submenuIndex = index + 1;
    showSubmenuData(submenuIndex, button);

    button.addEventListener("click", (event) => {
      event.stopPropagation();
      showSubmenuData(submenuIndex, button);
      submenu.style.display = "flex";
    });
  });

  await refreshCompanyData();

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

    restRemainer.innerText = "Faltam".toUpperCase();
    hintTextRemaining.innerText = `${daysRemaining} dias`.toUpperCase();

    remainingDaysContainer.style.display = "flex";
  }

  if (csn === 2) {
    if (!processId) {
      window.location.href = "botoesetapas.html";
      return;
    } else {
      document.getElementById("current-process").innerText =
        "Processo:".toUpperCase();
      document.getElementById("current-process-number").innerText = processId;
      document.querySelector(".current-process-container").style.display =
        "flex";
    }
  }
};

document.addEventListener("click", function (event) {
  const submenuBotao = document.querySelector("#submenu_botao");
  if (!submenuBotao.contains(event.target)) {
    submenuBotao.style.display = "none";
  }

  event.stopPropagation();
});

function handleUserModal(event) {
  const userModal = document.getElementById("account-content");
  if (userModal.style.display === "none") {
    userModal.style.display = "flex";
  } else {
    userModal.style.display = "none";
  }

  event.stopPropagation();
}

document
  .getElementById("account-popover")
  .addEventListener("click", handleUserModal);

document.addEventListener("click", function (event) {
  const accountContent = document.getElementById("account-content");

  if (
    event.target !== accountContent &&
    !accountContent.contains(event.target)
  ) {
    accountContent.style.display = "none";
  }

  event.stopPropagation();
});
