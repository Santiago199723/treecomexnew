const processIdDropdown = document.getElementById("process-id-dropdown");
const saveButton = document.getElementById("save-process");

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

  const response = await fetch(`/process?${params}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  const processIds = await response.json();
  if (response.ok && processIds.length > 0) {
    processIds.forEach((id) => {
      const option = document.createElement("option");
      option.value = id;
      option.text = id;
      processIdDropdown.appendChild(option);
    });
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

saveButton.addEventListener("click", function () {
  const selectedProcessId = processIdDropdown.value;
  localStorage.setItem("processId", selectedProcessId);
  window.location.href = "etapa2.html";
});
