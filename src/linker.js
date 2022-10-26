import modalHtml from "./modal.html";
import { gql, GraphQLClient } from "graphql-request";
let selection = null;

const client = new GraphQLClient("http://localhost:3000/api/graphql", {
  headers: {},
});

// get current selection and send it to the extension on request
chrome.runtime.onMessage.addListener(async function (
  request,
  sender,
  sendResponse
) {
  if (request.method == "getSelection")
    sendResponse({ selection: window.getSelection().toString() });

  if (request.method == "menuClicked") {
    renderModal({ request });
  }
});

let modal, modalContent, searchInput;

async function renderModal() {
  const user = (await chrome.storage.sync.get(["newtUser"])) || {};
  const { newtUser } = user;
  console.log({ newtUser });

  selection = window.getSelection().toString();
  document.body.insertAdjacentHTML("beforeend", modalHtml);
  modal = document.getElementById("newt-modal");
  // handle remove modal on background click
  modal.onclick = (event) => {
    if (event.target === modal) {
      modal.remove();
    }
  };

  modalContent = document.getElementById("newt-modal-content");
  // handle page button click
  modalContent.addEventListener("click", (e) => {
    if (e.target && e.target.nodeName === "BUTTON") {
      addSelectionToPage(e.target.dataset.pageId);
      modal.remove();
    }
  });

  searchInput = document.getElementById("newt-search-input");
  // handle search
  searchInput.addEventListener("keyup", (e) => {
    updateList({ value: e.target.value, modal });
  });

  // GET PAGES
  try {
    if (user) {
      const pages = await getPages({ newtUser });
      appendPagesToModalContent(pages, modalContent);
    }
  } catch (e) {
    console.log(e);
  }
}

async function updateList({ value, modal, modalContent, cookie }) {
  const filter = `LIKE(page.title, "%${value}%", true)`;
  const pages = await getPages({ filter, cookie });
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
    try {
      const source = window.location.href;
      const mutation = gql`
        mutation AddSelectionToPageContent(
          $pageId: String!
          $selection: String!
          $source: String!
        ) {
          addSelectionToPageContent(
            pageId: $pageId
            selection: $selection
            source: $source
          ) {
            _id
            content
          }
        }
      `;

      const response = await client.request(mutation, {
        pageId,
        selection,
        source,
      });

      console.log({ response });

      return response;
    } catch (error) {
      console.log(error);
    }
  }
}

async function getPages({ filter = null, offset = 0, count = 10, newtUser }) {
  try {
    const query = gql`
      query AllPages(
        $userId: String!
        $filters: [FilterInput]
        $offset: Int
        $count: Int
      ) {
        user(userId: $userId) {
          id
          pages(filters: $filters, offset: $offset, count: $count) {
            _id
            _key
            title
            private
            owner {
              id
            }
          }
        }
      }
    `;

    const filters = filter ? [{ filter }] : [];
    const variables = { filters, offset, count, userId: newtUser.sub };
    const data = await client.request(query, variables);
    return data?.user?.pages || [];
  } catch (e) {
    console.log(e);
  }
}
