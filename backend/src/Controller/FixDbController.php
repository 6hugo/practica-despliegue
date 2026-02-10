<?php

namespace App\Controller;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class FixDbController extends AbstractController
{
    #[Route('/api/fix-db', name: 'app_fix_db', methods: ['GET'])]
    public function index(EntityManagerInterface $entityManager): JsonResponse
    {
        $connection = $entityManager->getConnection();
        
        $sql = "
            CREATE TABLE IF NOT EXISTS favorite (
                id INT AUTO_INCREMENT NOT NULL, 
                user_id INT NOT NULL, 
                character_id INT NOT NULL, 
                name VARCHAR(255) NOT NULL, 
                portrait_path VARCHAR(255) DEFAULT NULL, 
                INDEX IDX_68C58ED9A76ED395 (user_id), 
                PRIMARY KEY(id)
            ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB;
        ";

        try {
            $connection->executeStatement($sql);
            
            // Add foreign key separately to avoid error if it exists
            try {
                $connection->executeStatement("ALTER TABLE favorite ADD CONSTRAINT FK_68C58ED9A76ED395 FOREIGN KEY (user_id) REFERENCES `user` (id)");
            } catch (\Exception $e) {
                // Ignore if constraint already exists
            }

            return new JsonResponse(['status' => 'Success', 'message' => 'Favorite table created or already exists.']);
        } catch (\Exception $e) {
            return new JsonResponse(['status' => 'Error', 'message' => $e->getMessage()], 500);
        }
    }
}
