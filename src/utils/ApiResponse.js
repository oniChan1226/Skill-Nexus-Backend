class ApiResponse {
    constructor(statusCode, data, message) {
        this.statusCode = statusCode;
        if(data) {
            Object.assign(this, data);
        }
        this.message = message;
        this.success = statusCode < 400;
    }
};

export { ApiResponse };