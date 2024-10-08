import getToken from "./getToken.js";

(async function () {
  const [email, password] = process.argv.slice(2);

  try {
    const access_token = await getToken(email, password);
    console.log("Access Token:", access_token);
  } catch (error) {
    console.error("Error retrieving access token:", error.message || error);
  }
})();
