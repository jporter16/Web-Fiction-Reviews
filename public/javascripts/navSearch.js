const navForm = document.getElementById("nav-search");
console.log("nav form");
if (navForm) {
  console.log("navform");
  navForm.addEventListener("submit", (e) => {
    console.log("submitted");
    e.preventDefault();
    const formData = new FormData(navForm);
    const title = formData.get("filter[title]");
    const url = new URL("http://localhost:3000/fiction");
    const charactersToCheck = ["<", ">", "&", "'", `"`, `/`, "$"];

    url.searchParams.set("title", encodeURIComponent(title));
    window.location.href = url;
  });
}
