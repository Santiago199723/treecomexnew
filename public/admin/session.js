window.onload = function() {
    const k = localStorage.getItem("__sess_admin__")
    if (!k) window.location.href = "/index.html"
}