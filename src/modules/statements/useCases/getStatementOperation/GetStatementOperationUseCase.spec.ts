import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let usersRepository: InMemoryUsersRepository;
let statementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;
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

describe("Get Statement Operation", () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository();
    statementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      usersRepository,
      statementsRepository
    );
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      usersRepository,
      statementsRepository
    );
    createUserUseCase = new CreateUserUseCase(usersRepository);
  });

  it("Should be able to get statement operation", async () => {
    const result = await createUserUseCase.execute(user);
    const statement = await createStatementUseCase.execute(
      defaultStatement("deposit" as OperationType, <string>result.id)
    );

    const operation = await getStatementOperationUseCase.execute({
      statement_id: <string>statement.id,
      user_id: <string>result.id,
    });

    expect(operation).toBeTruthy();
  });

  it("Should not be able to get statement operation with invalid user id", async () => {
    const result = await createUserUseCase.execute(user);
    const statement = await createStatementUseCase.execute(
      defaultStatement("deposit" as OperationType, <string>result.id)
    );

    const promise = getStatementOperationUseCase.execute({
      statement_id: <string>statement.id,
      user_id: "invalid_id",
    });

    await expect(promise).rejects.toBeInstanceOf(
      GetStatementOperationError.UserNotFound
    );
  });

  it("Should not be able to get statement operation with invalid statement id", async () => {
    const result = await createUserUseCase.execute(user);
  
    const promise = getStatementOperationUseCase.execute({
      statement_id: "invalid id",
      user_id: <string>result.id,
    });

    await expect(promise).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound)
  });
});
