<?php
/**
 * Authentication Middleware
 */

require_once __DIR__ . '/../config/jwt.php';
require_once __DIR__ . '/../utils/Response.php';

class AuthMiddleware {
    public static function authenticate() {
        $token = JWTHelper::getTokenFromHeader();
        
        if (!$token) {
            Response::unauthorized("Access token is required");
        }

        $user_data = JWTHelper::validateToken($token);
        
        if (!$user_data) {
            Response::unauthorized("Invalid or expired token");
        }

        return $user_data;
    }

    public static function requireAdmin() {
        $user_data = self::authenticate();
        
        if ($user_data['role'] !== 'admin') {
            Response::forbidden("Admin access required");
        }

        return $user_data;
    }

    public static function optionalAuth() {
        $token = JWTHelper::getTokenFromHeader();
        
        if (!$token) {
            return null;
        }

        return JWTHelper::validateToken($token);
    }
}

