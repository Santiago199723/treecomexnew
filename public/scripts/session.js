window.addEventListener("load", function () {
  const k =
    localStorage.getItem("__sess_admin__") ??
    localStorage.getItem("__sess_master__");
  if (!k) window.location.href = "/index.html";
});
