import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

let usersRepository: InMemoryUsersRepository;
let statementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
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

describe("Create Statement", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      usersRepository,
      statementsRepository
    );
    createUserUseCase = new CreateUserUseCase(usersRepository);
  });

  it("Should be able to create deposit statement", async () => {
    const result = await createUserUseCase.execute(user);
    const statement = await createStatementUseCase.execute(
      defaultStatement("deposit" as OperationType, <string>result.id)
    );

    expect(statement).toHaveProperty("id");
  });

  it("Should be able to create withdraw statement", async () => {
    const result = await createUserUseCase.execute(user);
    await createStatementUseCase.execute(
      defaultStatement("deposit" as OperationType, <string>result.id)
    );
    const statement = await createStatementUseCase.execute(
      defaultStatement("withdraw" as OperationType, <string>result.id)
    );

    expect(statement).toHaveProperty("id");
    expect(statement.amount).toEqual(10);
  });

  it("Should not be able to create statement with invalid user id", async () => {
    const promise = createStatementUseCase.execute(
      defaultStatement("deposit" as OperationType, "invalid_id")
    );

    await expect(promise).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
  });

  it('Should not be able to create withdraw statement with insufficient funds', async () => {
    const result = await createUserUseCase.execute(user);
    const promise = createStatementUseCase.execute(
      defaultStatement("withdraw" as OperationType, <string>result.id)
    );

    await expect(promise).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  });
});
