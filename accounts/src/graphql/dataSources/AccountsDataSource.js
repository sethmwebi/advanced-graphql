import { DataSource } from "apollo-datasource";
import { UserInputError } from "apollo-server";
import getToken from "../../utils/getToken.js";

class AccountsDatasource extends DataSource {
  constructor({ auth0 }) {
    super();
    this.auth0 = auth0;
  }

  // Data fetching methods will go here
  createAccount(email, password) {
    return this.auth0.createUser({
      connection: "Username-Password-Authentication",
      email,
      password,
    });
  }

  updateAccountEmail(id, email) {
    return this.auth0.updateUser({ id }, { email });
  }

  async updateAccountPassword(id, newPassword, password) {
    const user = await this.auth0.getUser({ id });
    try {
      await getToken(user.email, password);
    } catch {
      throw new UserInputError("Email or existing password is incorrect");
    }
    return this.auth0.updateUser({ id }, { password: newPassword });
  }

  async deleteAccount(id) {
    try {
      await this.auth0.deleteUser({ id });
      return true;
    } catch {
      return false;
    }
  }

  getAccountById(id) {
    return this.auth0.getUser({ id });
  }

  getAccounts() {
    return this.auth0.getUsers();
  }
}

export default AccountsDatasource;
