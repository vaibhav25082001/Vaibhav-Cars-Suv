function pickSource(req, source) {
  if (source === "params") {
    return req.params;
  }

  if (source === "query") {
    return req.query;
  }

  if (source === "headers") {
    return req.headers;
  }

  return req.body;
}

function formatValidationError(error) {
  if (Array.isArray(error?.details)) {
    return error.details.map((detail) => ({
      field: detail.path?.join("."),
      message: detail.message,
    }));
  }

  if (Array.isArray(error?.issues)) {
    return error.issues.map((issue) => ({
      field: issue.path?.join("."),
      message: issue.message,
    }));
  }

  return [{ message: error.message || "Invalid request data" }];
}

function validate(schema, source = "body") {
  return (req, res, next) => {
    try {
      const data = pickSource(req, source);

      if (typeof schema.validate === "function") {
        const result = schema.validate(data, {
          abortEarly: false,
          stripUnknown: true,
        });

        if (result.error) {
          return res.status(400).json({
            message: "Validation failed",
            errors: formatValidationError(result.error),
          });
        }

        req[source] = result.value;
        return next();
      }

      if (typeof schema.safeParse === "function") {
        const result = schema.safeParse(data);

        if (!result.success) {
          return res.status(400).json({
            message: "Validation failed",
            errors: formatValidationError(result.error),
          });
        }

        req[source] = result.data;
        return next();
      }

      if (typeof schema.parse === "function") {
        req[source] = schema.parse(data);
        return next();
      }

      throw new Error("Unsupported validation schema");
    } catch (error) {
      if (error.name === "ZodError" || error.isJoi) {
        return res.status(400).json({
          message: "Validation failed",
          errors: formatValidationError(error),
        });
      }

      return next(error);
    }
  };
}

function validateRequest(schemas) {
  return (req, res, next) => {
    const middlewares = Object.entries(schemas).map(([source, schema]) =>
      validate(schema, source)
    );

    let index = 0;

    function run(error) {
      if (error) {
        return next(error);
      }

      const middleware = middlewares[index];
      index += 1;

      if (!middleware) {
        return next();
      }

      return middleware(req, res, run);
    }

    return run();
  };
}

module.exports = {
  validate,
  validateRequest,
};
