class CustomError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class AryionUserNotFoundError extends CustomError {
  username: string;

  constructor(username: string) {
    super(`User not found: ${username}`);
    this.username = username;
  }
}
