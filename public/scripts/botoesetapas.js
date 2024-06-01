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

  const params = new URLSearchParams({
    company: companyData.cpf ? companyData.cpf : companyData.cnpj,
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
  showCompanyData();
};

function openModal() {
  document.getElementById("overlay").style.display = "flex";
}

function closeModal() {
  document.getElementById("overlay").style.display = "none";
}

let offsetX, offsetY;

let draggable = document.querySelector(".modal-container");
let input = document.querySelector("#process-id");

function drag(event) {
  draggable.style.left = event.clientX - offsetX + "px";
  draggable.style.top = event.clientY - offsetY + "px";
}

function stopDragging(event) {
  document.removeEventListener("mousemove", drag);
  document.removeEventListener("mouseup", stopDragging);
}

function draggableHandler(event) {
  event.preventDefault();

  offsetX = event.clientX - draggable.getBoundingClientRect().left;
  offsetY = event.clientY - draggable.getBoundingClientRect().top;

  document.addEventListener("mousemove", drag);

  document.addEventListener("mouseup", stopDragging);
}

draggable.addEventListener("mousedown", draggableHandler);

processIdDropdown.addEventListener("mouseenter", function () {
  draggable.removeEventListener("mousedown", draggableHandler);
});

processIdDropdown.addEventListener("mouseleave", function () {
  draggable.addEventListener("mousedown", draggableHandler);
});

saveButton.addEventListener("mouseenter", function () {
  draggable.removeEventListener("mousedown", draggableHandler);
});

saveButton.addEventListener("mouseleave", function () {
  draggable.addEventListener("mousedown", draggableHandler);
});

saveButton.addEventListener("click", function () {
  const selectedProcessId = processIdDropdown.value;
  localStorage.setItem("processId", selectedProcessId);
  window.location.href = "etapa2.html";
});
