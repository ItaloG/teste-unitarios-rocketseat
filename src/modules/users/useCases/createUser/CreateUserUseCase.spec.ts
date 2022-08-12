import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { ICreateUserDTO } from "./ICreateUserDTO";

let usersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

const user: ICreateUserDTO = {
  email: "any_email",
  name: "any_name",
  password: "any_password",
};

describe("Create User", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepository);
  });

  it("Should be able to create a user", async () => {
    const result = await createUserUseCase.execute(user);

    expect(result).toHaveProperty("id");
  });

  it("Should not be able to create a user if email already in use", async () => {
    await createUserUseCase.execute(user);
    expect(async () => createUserUseCase.execute(user)).rejects.toBeInstanceOf(
      CreateUserError
    );
  });

  it("Should password hashed to create a user", async () => {
    const result = await createUserUseCase.execute(user);

    expect(result).not.toEqual(user.password);
  });
});
