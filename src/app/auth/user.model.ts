export class UserModel {
  constructor(
    public email: string,
    public idUser: string,
    private token: string,
    private tokenExpirationDate: Date) {}

    get tokenn() {
      if (!this.tokenExpirationDate || new Date() > this.tokenExpirationDate) {
        return null;
      }
      return this.token;
    }
}
