const ERRORS: object = {
    'INVALID_PARAMETER': 'Invalid parameter',
    'INVALID_PARAMETER_TYPE': 'Invalid parameter type',
    'INVALID_PARAMETER_VALUE': 'Invalid parameter value',
    'INVALID_PARAMETER_LENGTH': 'Invalid parameter length',
    'INVALID_PARAMETER_FORMAT': 'Invalid parameter format',
    'INVALID_PARAMETER_RANGE': 'Invalid parameter range',
    'INVALID_PARAMETER_REQUIRED': 'Invalid parameter required',
    'INVALID_PARAMETER_UNIQUE': 'Invalid parameter unique',
    'INVALID_PARAMETER_EXIST': 'Invalid parameter exist',
    'KEY_NOT_FOUND': 'Key not found',
    'KEY_EXPIRED': 'Key expired',
    'KEY_NOT_EXIST': 'Key not exist',
    'KEY_NOT_UNIQUE': 'Key not unique',
    'STORE_NOT_FOUND': 'Store not found',
    'STORE_NOT_EXIST': 'Store not exist',
    'STORE_NOT_UNIQUE': 'Store not unique'
}

/**
 * A function that handles errors
 * @param error {string} error 
 * @returns 
 */
export default function ErrorHandler(error: string) {
    console.log(error);
}