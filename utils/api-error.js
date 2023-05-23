class ApiError extends Error {
  constructor(message,statusCode,ejsView,ejsOptions={}) {
    super(message);
    this.statusCode = statusCode;
    this.ejsView=ejsView
    this.ejsOptions=ejsOptions
  }
}

export {ApiError};