const tagForm = document.getElementById("tagSelectionForm");
if (tagForm) {
  tagForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(tagForm);
    const tags = formData.getAll("filter[tags]");
    const title = formData.get("filter[title]");
    const description = formData.get("filter[description]");
    const url = new URL(window.location.href);
    url.searchParams.set("tags", tags.join(","));
    url.searchParams.set("title", title);
    url.searchParams.set("description", description);
    window.location.href = url;
  });
}
