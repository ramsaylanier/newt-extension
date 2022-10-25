import { AUTH0_DOMAIN, AUTH0_CLIENT_ID } from "../config.prod";
import createAuth0Client from "@auth0/auth0-spa-js";

export const auth0 = await createAuth0Client({
  domain: AUTH0_DOMAIN,
  client_id: AUTH0_CLIENT_ID,
  redirect_uri: window.location.href,
});

const loginButton = document.getElementById("login-button");

loginButton.onclick = async () => {
  console.log("click");
  try {
    const newtUser = await auth0.getUser();
    if (!newtUser) {
      await auth0.loginWithRedirect();
    } else {
      chrome.storage.sync.set({ newtUser });
    }
  } catch (error) {
    console.log(error);
    if (error.error !== "login_required") {
      throw error;
    }
  }
};

window.addEventListener("load", async () => {
  const redirectResult = await auth0.handleRedirectCallback();
  const newtUser = await auth0.getUser();
  chrome.storage.sync.set({ newtUser });
  return redirectResult;
});
