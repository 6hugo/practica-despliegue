<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\User;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

final class UserPasswordHasher implements ProcessorInterface
{
    public function __construct(
        // Indicamos el ID del servicio de persistencia para evitar la ambigüedad
        #[Autowire(service: 'api_platform.doctrine.orm.state.persist_processor')]
        private ProcessorInterface $persistProcessor,
        private UserPasswordHasherInterface $passwordHasher
    ) {}

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        // Si es un objeto de tipo User y trae una contraseña sin encriptar
        if ($data instanceof User && $data->getPlainPassword()) {
            $hashedPassword = $this->passwordHasher->hashPassword($data, $data->getPlainPassword());
            $data->setPassword($hashedPassword);
            $data->eraseCredentials(); // Limpiamos la contraseña en plano por seguridad
        }

        return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
    }
}