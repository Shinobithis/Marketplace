<?php
/**
 * JWT Configuration and Helper Functions
 */

require_once __DIR__ . '/../vendor/autoload.php';
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JWTHelper {
    private static $secret_key = "bsg_marketplace_secret_key_2024";
    private static $issuer = "bsg-marketplace";
    private static $audience = "bsg-users";
    private static $algorithm = "HS256";

    public static function generateToken($user_data) {
        $issued_at = time();
        $expiration_time = $issued_at + (24 * 60 * 60); // 24 hours

        $payload = array(
            "iss" => self::$issuer,
            "aud" => self::$audience,
            "iat" => $issued_at,
            "exp" => $expiration_time,
            "data" => array(
                "id" => $user_data['id'],
                "username" => $user_data['username'],
                "email" => $user_data['email'],
                "role" => $user_data['role']
            )
        );

        return JWT::encode($payload, self::$secret_key, self::$algorithm);
    }

    public static function validateToken($token) {
        try {
            $decoded = JWT::decode($token, new Key(self::$secret_key, self::$algorithm));
            return (array) $decoded->data;
        } catch (Exception $e) {
            return false;
        }
    }

    public static function getTokenFromHeader() {
        $headers = getallheaders();
        
        if (isset($headers['Authorization'])) {
            $auth_header = $headers['Authorization'];
            if (preg_match('/Bearer\s(\S+)/', $auth_header, $matches)) {
                return $matches[1];
            }
        }
        
        return null;
    }
}

