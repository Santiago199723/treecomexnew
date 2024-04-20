window.onload = function () {
  checkSession().then((session) => {
    if (!session) {
      window.location.href = "/";
    }
  });
};
