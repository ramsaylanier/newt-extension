import { createClient, gql } from "simple-gql";
let selection = "";
let pages = [];
const client = createClient("http://localhost:3000/api/graphql");

// get current selection and send it to the extension on request
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.method == "getSelection")
    sendResponse({ selection: window.getSelection().toString() });

  if (request.method == "menuClicked") {
    renderModal();
  }
});

async function renderModal() {
  let searchText = "";
  selection = window.getSelection().toString();
  const modal = document.createElement("div");
  modal.classList = "newt-modal";
  document.body.append(modal);

  const modalContent = document.createElement("div");
  modalContent.classList = "newt-modal-content";
  modal.append(modalContent);

  const modalTitle = document.createElement("h1");
  modalTitle.classList = "newt-modal-title";
  modalTitle.innerHTML = "Add Selection To Page:";
  modalContent.append(modalTitle);

  const searchInput = document.createElement("input");
  searchInput.setAttribute("type", "text");
  searchInput.setAttribute("placeholder", "Search for a page");
  searchInput.classList = "newt-search-input";
  searchInput.addEventListener("keyup", (e) => {
    updateList(e.target.value, modal, modalContent);
  });
  modalContent.append(searchInput);

  try {
    const data = await getPages();
    pages = data ? data.pages : [];
    appendPagesToModalContent(pages, modalContent);

    modalContent.addEventListener("click", (e) => {
      if (e.target && e.target.nodeName === "BUTTON") {
        addSelectionToPage(e.target.dataset.pageId);
        modal.remove();
      }
    });

    function filterList(value) {}
  } catch (e) {
    console.log(e);
  }
}

async function updateList(value, modal, modalContent) {
  const filter = `LIKE(page.title, "%${value}%", true)`;
  const data = await getPages(filter);
  const pages = data ? data.pages : [];
  const existingButtons = modal.querySelectorAll(".newt-page-button");

  existingButtons.forEach((button) => {
    button.remove();
  });

  appendPagesToModalContent(pages, modalContent);
}

function appendPagesToModalContent(pages, modalContent) {
  pages.forEach((page) => {
    const pageNode = document.createElement("button");
    pageNode.classList = "newt-page-button";
    pageNode.innerText = page.title;
    pageNode.setAttribute("data-page-id", page._id);
    modalContent.appendChild(pageNode);
  });
}

async function addSelectionToPage(pageId) {
  if (pageId) {
    const mutation = gql`
      mutation AddSelectionToPageContent(
        $pageId: String!
        $selection: String!
      ) {
        addSelectionToPageContent(pageId: $pageId, selection: $selection) {
          _id
          content
        }
      }
    `;
    const response = await client.request(mutation, {
      pageId,
      selection,
    });
  }
}

async function getPages(filter = null, offset = 0, count = 10) {
  try {
    const query = gql`
      query AllPages($filters: [FilterInput], $offset: Int, $count: Int) {
        pages(filters: $filters, offset: $offset, count: $count) {
          _id
          title
        }
      }
    `;

    const filters = filter ? [{ filter }] : [];

    return client.request(query, {
      filters,
      offset,
      count,
    });
  } catch (e) {
    console.log(e);
  }
}
