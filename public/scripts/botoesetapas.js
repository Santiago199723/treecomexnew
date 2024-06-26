let codes;
const saveButton = document.getElementById("save-process");
const dropdownContent = document.getElementById("selectize-content");
let processID = document.getElementById("showCategories-selectized");

window.onload = async function () {
  const userResponse = await fetch("/user", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  const userData = await userResponse.json();
  if (userResponse.ok && userData.userType === UserType.MASTER) {
    document.getElementById("financial").style.display = "flex";
  } else {
    if (!company) window.location.href = "/index.html";
  }

  const email = document.getElementById("email");
  email.innerHTML = userData.email;

  const params = new URLSearchParams({
    company: companyData.cnpj,
  });

  try {
    const response = await fetch(`/process?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Erro ao obter os dados");
    }

    const data = await response.json();
    if (data.length > 0) {
      codes = data;
      if (codes) {
        codes.forEach((code) => {
          const div = document.createElement("div");
          div.className = "category zze-truncate zze-icon-left";
          div.style.cursor = "pointer";
          div.addEventListener("click", function (e) {
            if (e.target !== e.currentTarget.querySelector("img")) {
              localStorage.setItem("processId", code)
              window.location.href = "/etapa2.html";
            }
          });

          const i = document.createElement("i");
          i.className = "zze-icon-categories icon-category-recipient";
          i.style.display = "flex";
          i.style.justifyContent = "center";
          i.style.backgroundColor = "#626491";

          const span = document.createElement("span");
          span.textContent = code;
          span.className = "zze-selectize-label";

          div.appendChild(i);
          div.appendChild(span);

          dropdownContent.appendChild(div);
        });
      }
    }
  } catch (error) {
    console.error(error);
    alert(
      "Ocorreu um erro ao carregar os dados. Por favor, tente novamente.",
    );
  }

  await refreshCompanyData();
  await showCompanyData();
};

function openModal() {
  document.getElementById("overlay").style.display = "flex";
}

function closeModal() {
  document.getElementById("overlay").style.display = "none";
}

function filterProcesses() {
  const searchText = processID.value.toLowerCase();
  dropdownContent.innerHTML = "";

  if (codes) {
    codes.forEach(async (code) => {
      if (searchText === "" || code.toLowerCase().includes(searchText)) {
        const div = document.createElement("div");
        div.className = "category zze-truncate zze-icon-left";
        div.style.cursor = "pointer";
        div.addEventListener("click", function () {
          processID.value = code;
        });

        const i = document.createElement("i");
        i.className = "zze-icon-categories icon-category-recipient";
        i.style.display = "flex";
        i.style.justifyContent = "center";
        i.style.backgroundColor = "#626491";

        const span = document.createElement("span");
        span.textContent = code;
        span.className = "zze-selectize-label";

        div.appendChild(i);
        div.appendChild(span);

        dropdownContent.appendChild(div);
      }
    });
  }
}

processID.addEventListener("input", filterProcesses);
