import { RegisterUser } from "../../use-cases";
import { HttpRequest, HttpResponse, StatusCode } from "http-controller.types";
import { logger } from "../../services/logger";
import SystemError from '../../system-errors/system-error';
import { ServiceErrorCodes, UserErrorCodes } from '../../system-errors/error-codes';

const useCase = new RegisterUser();

export default async function registerUser(httpRequest: HttpRequest): Promise<HttpResponse> {
  try {
    const result = await useCase.execute(httpRequest.body);

    if (result instanceof SystemError) {
      let statusCode: StatusCode = 400;

      switch (result.errorCode) {
        case UserErrorCodes.EXISTED:
          statusCode = 409;
          break;
        case UserErrorCodes.VALIDATION:
          statusCode = 400;
          break;
        case ServiceErrorCodes.INTERNAL:
          statusCode = 500;
      }

      return {
        headers: {
          "Content-Type": "application/json"
        },
        body: { error: result.message },
        statusCode: statusCode
      };
    }
    return {
      headers: {
        "Content-Type": "application/json"
      },
      body: {
        result,
        error: null
      },
      statusCode: 201
    };
  } catch (err) {
    logger.error(err);

    return {
      headers: {
        "Content-Type": "application/json"
      },
      body: { error: "Internal Server Error." },
      statusCode: 500
    };
  }
}