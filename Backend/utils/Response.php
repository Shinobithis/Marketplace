<?php
/**
 * Response Helper Class
 */

class Response {
    public static function json($data, $status_code = 200) {
        http_response_code($status_code);
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }

    public static function success($data = null, $message = "Success", $status_code = 200) {
        self::json([
            'success' => true,
            'message' => $message,
            'data' => $data
        ], $status_code);
    }

    public static function error($message = "An error occurred", $status_code = 400, $errors = null) {
        self::json([
            'success' => false,
            'message' => $message,
            'errors' => $errors
        ], $status_code);
    }

    public static function unauthorized($message = "Unauthorized access") {
        self::error($message, 401);
    }

    public static function forbidden($message = "Access forbidden") {
        self::error($message, 403);
    }

    public static function notFound($message = "Resource not found") {
        self::error($message, 404);
    }

    public static function validationError($errors, $message = "Validation failed") {
        self::error($message, 422, $errors);
    }
}