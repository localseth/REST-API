// Handler function to wrap each route.
exports.asyncHandler = (cb) => {
    return async (req, res, next) => {
      try {
        await cb(req, res, next);
      } catch (error) {
        if (error.name === 'SequelizeValidationError') {
          const errors = error.errors.map(err => err.message);
          console.error('Validation errors: ', errors);
          next(error);
        } else {
          // throw error;
          next(error);
        }
      }
    }
  }