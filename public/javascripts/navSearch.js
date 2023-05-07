const navForm = document.getElementById("nav-search");
if (navForm) {
  navForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(navForm);
    const title = formData.get("filter[title]");
    const url = new URL("https://www.webfictionreviews.com/fiction");
    const charactersToCheck = ["<", ">", "&", "'", `"`, `/`, "$"];

    url.searchParams.set("title", encodeURIComponent(title));
    window.location.href = url;
  });
}
