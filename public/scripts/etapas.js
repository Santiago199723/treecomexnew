const submenu = document.querySelector(".file-management");
const csn = Number(window.location.pathname.match(/[0-9]+/)[0]);

async function addFile(file, btnIndex) {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("name", "file");
  formData.append("mimeType", file.type);

  const response = await fetch("/upload-file", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (response.ok) {
    await fetch("/sniff", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "uploaded_file",
        data: {
          fileId: data.fileId,
          optionType: getOptionType(btnIndex),
          stageNumber: csn,
          processId: csn === 2 ? processId : "",
        },
        company: companyData.cnpj,
      }),
      credentials: "include",
    });
  }

  alert(data.message);
}

async function removeFile(fileId, btnIndex) {
  const response = await fetch("/sniff", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "removed_file",
      data: {
        fileId: fileId,
        optionType: getOptionType(btnIndex),
        stageNumber: csn,
        processId: csn !== 1 ? processId : undefined,
      },
      company: companyData.cnpj,
    }),
    credentials: "include",
  });

  if (response.ok) {
    alert("Arquivo excluido com sucesso");
  }
}

document.getElementById("add-file-button").addEventListener("click", () => {
  document.getElementById("file-input").click();
});

async function loadData(btnIndex, button, withFiles = false) {
  const fileList = document.getElementById("file-list");
  fileList.innerHTML = "";

  const option = getOptionType(btnIndex);
  if (option) {
    let obj = {
      company: companyData.cnpj,
      stage: csn,
      option: option,
    };

    if (csn !== 1) obj.processId = processId;
    const params = new URLSearchParams(obj);
    const response = await fetch(`/stage?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await response.json();
    if (response.ok && data.length !== 0) {
      const attachedFiles = data.filter((value) => value.type === 1);
      const removedFiles = data.filter((value) => value.type !== 1);

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
        // button.style.boxShadow = "-0.5rem -0.5rem 1rem hsl(183, 72%, 54%), 0.5rem 0.5rem 1rem hsl(0 0% 50% / 0.5)";
        const img = button.querySelector("img");
        img.style.display = "flex";
      } else {
        const img = button.querySelector("img");
        img.style.display = "none";
      }

      if (withFiles) {
        for (let i = 0; i < sortedData.length; i++) {
          const value = sortedData[i]
          if (value.fileId) {
            const fileItem = document.createElement("div");
            fileItem.className = "file-item";

            const fileInfo = document.createElement("div");
            fileInfo.className = "file-info";

            const fileActions = document.createElement("div");
            fileActions.className = "file-actions";

            const fileName = document.createElement("span");
            fileName.className = "file-name";

            const downloadLink = document.createElement("a");
            downloadLink.className = "icon download-link";

            const removeLink = document.createElement("a");
            removeLink.className = "icon remove-link";

            const fileDetails = document.createElement("div");
            fileDetails.classList.add("file-details");

            const flabelText =
              value.type === 1 ? "Data de anexo" : "Data de exclusão";
            const slabelText =
              value.type === 1 ? "Anexado por" : "Removido por";

            const dateKey = value.type === 1 ? "attachedDate" : "removedDate";
            const actionKey = value.type === 1 ? "attachedBy" : "removedBy";

            if (
              i + 1 < sortedData.length &&
              sortedData[i + 1].fileId === value.fileId
            ) {
              const nextItemType = sortedData[i + 1].type;
              const nextDateKey =
                nextItemType === 1 ? "attachedDate" : "removedDate";
              const nextActionKey =
                nextItemType === 1 ? "attachedBy" : "removedBy";

              fileInfo.innerHTML += `
                    <div><span class="label" style="color: black;">Data de anexo:</span> ${formatDate(sortedData[i + 1][nextDateKey])}</div>
                    <div><span class="label" style="color: black;">Anexado por:</span> ${sortedData[i + 1][nextActionKey]}</div>
                    <div><span class="label" style="color: black;">Data de exclusão:</span> ${formatDate(value[dateKey])}</div>
                    <div><span class="label" style="color: black;">Removido por:</span> ${value[actionKey]}</div>
                `;

              fileItem.classList.add("removed");
              downloadLink.classList.add("disabled");
              removeLink.classList.add("disabled");
              i++
            } else {
              fileInfo.innerHTML += `
                    <div><span class="label" style="color: black;">${flabelText}:</span> ${formatDate(value[dateKey])}</div>
                    <div><span class="label" style="color: black;">${slabelText}:</span> ${value[actionKey]}</div>
                `;
            }

            const { filename, blob } = await getFile(value.fileId);

            fileName.innerText = filename;

            downloadLink.innerHTML =
              '<img src="/assets/download.png" alt="Download">';
            downloadLink.classList.add("wrapper");
            downloadLink.addEventListener("click", () => {
              const div = document.createElement("div");
              div.classList.add("downloader");
              document.querySelector(".main-container").appendChild(div);

              div.classList.add("load");
              div.innerHTML = `<div class="loader"></div>`;

              setTimeout(() => {
                div.classList.remove("load")
                div.innerHTML = `<div class="check"><i class="fas fa-check"></i></div>`;
              }, 4500);

              setTimeout(() => {
                const a = document.createElement("a");
                const url = URL.createObjectURL(blob);
                a.href = url;
                a.download = filename;
                a.click();
                URL.revokeObjectURL(url);
                //div.remove();
              }, 6000);
            });

            removeLink.innerHTML =
              '<img src="/assets/remover.png" alt="Remover">';
            removeLink.addEventListener("click", async () => {
              if (!fileItem.classList.contains("removed")) {
                if (confirm("Tem certeza que deseja apagar o arquivo?")) {
                  await removeFile(value.fileId, btnIndex, button);
                  await loadData(btnIndex, button, withFiles);
                }
              } else {
                alert("O arquivo já foi excluído.");
              }
            });

            if (value.type === 2) {
              fileItem.classList.add("removed");
              downloadLink.classList.add("disabled");
              removeLink.classList.add("disabled");
            }

            fileActions.appendChild(fileName);
            fileActions.appendChild(downloadLink);
            fileActions.appendChild(removeLink);

            fileItem.appendChild(fileInfo);
            fileItem.appendChild(fileActions);

            fileList.appendChild(fileItem);
          }

          document.getElementById("file-list").style.display = "block";
        }
      }
    }
  }
}

window.onload = async function () {
  setLoading(true);
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

  const buttons = document.querySelectorAll(".neumorphic");

  buttons.forEach(async (button, index) => {
    const submenuIndex = index + 1;
    await loadData(submenuIndex, button);

    button.addEventListener("click", async (event) => {
      event.stopPropagation();

      document.getElementById("file-input").onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
          if (validateFile(file)) {
            await addFile(file, submenuIndex, button);
            await loadData(submenuIndex, button, true);
          } else {
            alert(
              "Formato de arquivo inválido. Permitido apenas PDF, XML, PNG, JPEG e JPG.",
            );
          }
        }
      };

      setLoading(true);
      await loadData(submenuIndex, button, true);
      submenu.style.display = "flex";
      setLoading(false);
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
      window.location.href = "/botoesetapas.html";
      return;
    } else {
      document.getElementById("current-process").innerText =
        "Processo:".toUpperCase();
      document.getElementById("current-process-number").innerText = processId;
      document.querySelector(".current-process-container").style.display =
        "flex";
    }
  }

  setLoading(false);
};

document.addEventListener("click", function (event) {
  if (!submenu.contains(event.target)) {
    submenu.style.display = "none";
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

function validateFile(file) {
  const allowedExtensions = ["pdf", "xml", "png", "jpeg", "jpg"];
  const fileExtension = file.name.split(".").pop().toLowerCase();
  return allowedExtensions.includes(fileExtension);
}

async function getFile(fileId) {
  const response = await fetch(`/file/${fileId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (response.ok) {
    const filename = response.headers
      .get("Content-Disposition")
      .split("filename=")[1];
    const blob = await response.blob();

    return { filename, blob };
  }
}
