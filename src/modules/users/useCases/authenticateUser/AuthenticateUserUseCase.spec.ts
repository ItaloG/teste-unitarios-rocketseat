import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let usersRepository: InMemoryUsersRepository;
let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;

const user: ICreateUserDTO = {
  email: "any_email",
  name: "any_name",
  password: "any_password",
};

describe("Authenticate User", () => {
  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository);
    createUserUseCase = new CreateUserUseCase(usersRepository);
  });

  it("Should be able to authenticate user", async () => {
    await createUserUseCase.execute(user);
    const result = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });

    expect(result).toHaveProperty("token");
  });

  it("Should not be able to authenticate user with invalid email", async () => {
    await createUserUseCase.execute(user);
    const promise = authenticateUserUseCase.execute({
      email: "invalid_email",
      password: user.password,
    });

    await expect(promise).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("Should not be able to authenticate user with invalid password", async () => {
    await createUserUseCase.execute(user);
    const promise = authenticateUserUseCase.execute({
      email: user.email,
      password: "invalid_password",
    });

    await expect(promise).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
