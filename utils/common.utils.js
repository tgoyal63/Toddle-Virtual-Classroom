const CommonUtlis = {

  // Generating Response Format
  generateResponse: (statusCode, message, data) => {
    console.log(`msg: ${message}, data: ${data}`);
    return {
      statusCode,
      message,
      data,
    };
  },

  // Custom Error Format
  customError: (status, msg) => ({
    status,
    msg,
    isCustom: true,
  }),
};

Object.freeze(CommonUtlis);
module.exports = CommonUtlis;
