import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let usersRepository: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;
let createUserUseCase: CreateUserUseCase;

const user: ICreateUserDTO = {
  email: "any_email",
  name: "any_name",
  password: "any_password",
};

describe("Show User Profile", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository);
    createUserUseCase = new CreateUserUseCase(usersRepository);
  });

  it("Should be able to find user profile", async () => {
    const result = await createUserUseCase.execute(user);
    const profile = await showUserProfileUseCase.execute(<string>result.id);

    expect(profile).toBeTruthy();
    expect(profile.id).toEqual(result.id);
  });

  it("Should not be able to find user with invalid_id", async () => {
    await createUserUseCase.execute(user);
    const promise = showUserProfileUseCase.execute("invalid_id");
    await expect(promise).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
