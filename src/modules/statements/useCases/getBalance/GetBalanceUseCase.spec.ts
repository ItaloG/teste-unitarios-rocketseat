import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let usersRepository: InMemoryUsersRepository;
let statementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let getBalanceUseCase: GetBalanceUseCase;
let createUserUseCase: CreateUserUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

const user: ICreateUserDTO = {
  email: "any_email",
  name: "any_name",
  password: "any_password",
};

const defaultStatement = (
  type: OperationType,
  user_id: string
): ICreateStatementDTO => {
  return {
    amount: 10,
    description: "any_description",
    type,
    user_id,
  };
};

describe("Get Balance", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      usersRepository,
      statementsRepository
    );
    getBalanceUseCase = new GetBalanceUseCase(
      statementsRepository,
      usersRepository
    );
    createUserUseCase = new CreateUserUseCase(usersRepository);
  });

  it("Should be able to get a user deposit balance", async () => {
    const result = await createUserUseCase.execute(user);
    await createStatementUseCase.execute(
      defaultStatement("deposit" as OperationType, <string>result.id)
    );

    const balance = await getBalanceUseCase.execute({
      user_id: <string>result.id,
    });

    expect(balance).toBeTruthy();
  });

  it("Should be able to get a user withdraw balance", async () => {
    const result = await createUserUseCase.execute(user);
    await createStatementUseCase.execute(
      defaultStatement("deposit" as OperationType, <string>result.id)
    );
    await createStatementUseCase.execute(
      defaultStatement("withdraw" as OperationType, <string>result.id)
    );

    const balance = await getBalanceUseCase.execute({
      user_id: <string>result.id,
    });

    expect(balance).toBeTruthy();
  });

  it("Should not be able to get a user balance with invalid id", async () => {
    const promise = getBalanceUseCase.execute({
      user_id: "invalid_id",
    });

    await expect(promise).rejects.toBeInstanceOf(GetBalanceError);
  });
});
