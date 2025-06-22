<?php
/**
 * Authentication Controller
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/jwt.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Validator.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class AuthController {
    private $db;
    private $user;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->user = new User($this->db);
    }

    public function register() {
        $data = json_decode(file_get_contents("php://input"), true);

        $validator = new Validator();
        $validator
            ->required('username', $data['username'] ?? '')
            ->required('email', $data['email'] ?? '')
            ->required('password', $data['password'] ?? '')
            ->required('first_name', $data['first_name'] ?? '')
            ->required('last_name', $data['last_name'] ?? '')
            ->email('email', $data['email'] ?? '')
            ->minLength('password', $data['password'] ?? '', 6)
            ->minLength('username', $data['username'] ?? '', 3)
            ->maxLength('username', $data['username'] ?? '', 50);

        if (!empty($data['email']) && $this->user->emailExists($data['email'])) {
            $validator->errors['email'] = 'Email already exists';
        }

        if (!empty($data['username']) && $this->user->usernameExists($data['username'])) {
            $validator->errors['username'] = 'Username already exists';
        }

        if ($validator->hasErrors()) {
            Response::validationError($validator->getErrors());
        }

        $password_hash = $this->user->hashPassword($data['password']);

        $user_data = [
            'username' => $data['username'],
            'email' => $data['email'],
            'password_hash' => $password_hash,
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'phone' => $data['phone'] ?? null
        ];

        $user_id = $this->user->create($user_data);

        if ($user_id) {
            $user = $this->user->findById($user_id);
            $token = JWTHelper::generateToken($user);

            Response::success([
                'user' => $user,
                'token' => $token
            ], "User registered successfully", 201);
        } else {
            Response::error("Failed to create user", 500);
        }
    }

    public function login() {
        $data = json_decode(file_get_contents("php://input"), true);

        $validator = new Validator();
        $validator
            ->required('email', $data['email'] ?? '')
            ->required('password', $data['password'] ?? '')
            ->email('email', $data['email'] ?? '');

        if ($validator->hasErrors()) {
            Response::validationError($validator->getErrors());
        }

        $user = $this->user->findByEmail($data['email']);

        if (!$user || !$this->user->verifyPassword($data['password'], $user['password_hash'])) {
            Response::error("Invalid email or password", 401);
        }

        unset($user['password_hash']);

        $token = JWTHelper::generateToken($user);

        Response::success([
            'user' => $user,
            'token' => $token
        ], "Login successful");
    }

    public function me() {
        $user_data = AuthMiddleware::authenticate();
        $user = $this->user->findById($user_data['id']);

        if (!$user) {
            Response::notFound("User not found");
        }

        Response::success($user);
    }

    public function updateProfile() {
        $user_data = AuthMiddleware::authenticate();
        $data = json_decode(file_get_contents("php://input"), true);

        // Validate input
        $validator = new Validator();
        $validator
            ->required('first_name', $data['first_name'] ?? '')
            ->required('last_name', $data['last_name'] ?? '')
            ->maxLength('first_name', $data['first_name'] ?? '', 50)
            ->maxLength('last_name', $data['last_name'] ?? '', 50)
            ->maxLength('phone', $data['phone'] ?? '', 20);

        if ($validator->hasErrors()) {
            Response::validationError($validator->getErrors());
        }

        $update_data = [
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'phone' => $data['phone'] ?? null
        ];

        if ($this->user->update($user_data['id'], $update_data)) {
            $updated_user = $this->user->findById($user_data['id']);
            Response::success($updated_user, "Profile updated successfully");
        } else {
            Response::error("Failed to update profile", 500);
        }
    }

    public function logout() {
        Response::success(null, "Logged out successfully");
    }
}