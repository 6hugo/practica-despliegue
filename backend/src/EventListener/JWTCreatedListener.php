<?php

namespace App\EventListener;

use Lexik\Bundle\JWTAuthenticationBundle\Event\JWTCreatedEvent;
use App\Entity\User;

class JWTCreatedListener
{
    public function onJWTCreated(JWTCreatedEvent $event): void
    {
        try {
            $user = $event->getUser();
            $payload = $event->getData();

            if (!$user) {
                return;
            }

            // Safe retrieval of ID
            if (method_exists($user, 'getId')) {
                $payload['id'] = $user->getId();
            }

            // Ensure 'username' claim in token matches the User Provider lookup (email)
            $payload['username'] = $user->getEmail();

            // Prefer getUsername if available (our custom field) for display name
            if (method_exists($user, 'getUsername')) {                $payload['name'] = $user->getUsername();
            } else {
                $payload['name'] = $user->getUserIdentifier();
            }

            $event->setData($payload);
        } catch (\Throwable $e) {
            // Emergency logging
            file_put_contents(__DIR__ . '/../../jwt_debug_error.log', date('Y-m-d H:i:s') . ' - ' . $e->getMessage() . PHP_EOL . $e->getTraceAsString());
        }
    }
}