<?php
/**
 * Message Controller
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/Message.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/Validator.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';

class MessageController {
    private $db;
    private $message;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->message = new Message($this->db);
    }

    public function getConversations() {
        $user_data = AuthMiddleware::authenticate();
        $conversations = $this->message->getConversations($user_data['id']);
        Response::success($conversations);
    }

    public function getMessages() {
        $user_data = AuthMiddleware::authenticate();
        
        $listing_id = $_GET['listing_id'] ?? null;
        $other_user_id = $_GET['other_user_id'] ?? null;

        if (!$listing_id || !$other_user_id) {
            Response::error("listing_id and other_user_id are required", 400);
        }

        $messages = $this->message->getMessages($user_data['id'], $listing_id, $other_user_id);
        Response::success($messages);
    }

    public function create() {
        $user_data = AuthMiddleware::authenticate();
        $data = json_decode(file_get_contents("php://input"), true);

        $validator = new Validator();
        $validator
            ->required("listing_id", $data["listing_id"] ?? "")
            ->required("receiver_id", $data["receiver_id"] ?? "")
            ->required("message", $data["message"] ?? "")
            ->numeric("listing_id", $data["listing_id"] ?? "")
            ->numeric("receiver_id", $data["receiver_id"] ?? "")
            ->maxLength("message", $data["message"] ?? "", 1000);

        if ($validator->hasErrors()) {
            Response::validationError($validator->getErrors());
        }

        // Check if user is trying to message themselves
        if ($user_data['id'] == $data['receiver_id']) {
            Response::error("You cannot send a message to yourself", 400);
        }

        $message_data = [
            "listing_id" => (int)$data["listing_id"],
            "sender_id" => $user_data["id"],
            "receiver_id" => (int)$data["receiver_id"],
            "message" => $data["message"]
        ];

        $message_id = $this->message->create($message_data);

        if ($message_id) {
            $message = $this->message->findById($message_id);
            Response::success($message, "Message sent successfully", 201);
        } else {
            Response::error("Failed to send message", 500);
        }
    }

    public function markAsRead() {
        $user_data = AuthMiddleware::authenticate();
        $data = json_decode(file_get_contents("php://input"), true);

        $listing_id = $data['listing_id'] ?? null;
        $other_user_id = $data['other_user_id'] ?? null;

        if (!$listing_id || !$other_user_id) {
            Response::error("listing_id and other_user_id are required", 400);
        }

        $success = $this->message->markAsRead($user_data['id'], $listing_id, $other_user_id);

        if ($success) {
            Response::success(null, "Messages marked as read");
        } else {
            Response::error("Failed to mark messages as read", 500);
        }
    }
}

