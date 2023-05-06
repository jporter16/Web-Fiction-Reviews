const tagForm = document.getElementById("tagSelectionForm");
if (tagForm) {
  tagForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(tagForm);
    const tags = formData.getAll("filter[tags]");
    const title = formData.get("filter[title]");
    const description = formData.get("filter[description]");
    const url = new URL(window.location.href);
    const charactersToCheck = ["<", ">", "&", "'", `"`, `/`, "$"];
    if (charactersToCheck.some((char) => title.includes(char))) {
      const titleError = document.querySelector("#title-validation-error");
      if (titleError) {
        titleError.classList.remove("hide");
        titleError.textContent = `The following characters are not accepted in search terms: <, >, &, $, ' " or /`;
        titleError.style.color = "red";
      }
    } else if (charactersToCheck.some((char) => description.includes(char))) {
      const descriptionError = document.querySelector(
        "#description-validation-error"
      );
      if (descriptionError) {
        descriptionError.classList.remove("hide");
        descriptionError.textContent = `The following characters are not accepted in search terms: <, >, &, ' " or /`;
        descriptionError.style.color = "red";
      }
    } else {
      url.searchParams.set("tags", tags.join(","));
      url.searchParams.set("page", "1");
      url.searchParams.set("title", encodeURIComponent(title));
      url.searchParams.set("description", encodeURIComponent(description));
      window.location.href = url;
    }
  });
}

// This is for revealing the advanced search:
const showAdvancedSearch = document.getElementById("show-advanced-search");
window.addEventListener("load", toggleAdvancedSearch);
if (showAdvancedSearch) {
  showAdvancedSearch.addEventListener("click", () => {
    toggleAdvancedSearch();
  });
}

function toggleAdvancedSearch() {
  const form = document.querySelector("#tagSelectionForm");
  if (form.style.display === "none") {
    form.style.display = "block";
    if (showAdvancedSearch) {
      showAdvancedSearch.textContent = "Hide Search Options";
    }
  } else {
    form.style.display = "none";
    if (showAdvancedSearch) {
      showAdvancedSearch.textContent = "Advanced Search";
    }
  }
}
