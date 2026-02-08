<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

final class ApiController extends AbstractController
{
    #[Route('/api', name: 'app_api')]
    public function index(): JsonResponse
    {
        return $this->json([
    'mensaje' => 'Conexión total establecida',
    'microservicios' => 'Funcionando (5/5)',
    'base_de_datos' => 'MySQL conectada',
    'alumno' => 'Hugo'
]);
    }
}
