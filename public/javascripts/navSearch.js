const navForm = document.getElementById("nav-search");
if (navForm) {
  navForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(navForm);
    const title = formData.get("filter[title]");
    const url = new URL("http://localhost:3000/fiction");
    const charactersToCheck = ["<", ">", "&", "'", `"`, `/`, "$"];

    url.searchParams.set("title", encodeURIComponent(title));
    window.location.href = url;
  });
}
