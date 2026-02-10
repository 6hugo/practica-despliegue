<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use App\Repository\FavoriteRepository;
use Doctrine\ORM\Mapping as ORM;
use App\Entity\User;

use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: FavoriteRepository::class)]
#[ApiResource(
    normalizationContext: ['groups' => ['favorite:read']],
    denormalizationContext: ['groups' => ['favorite:write']]
)]
#[ApiFilter(SearchFilter::class, properties: ['user' => 'exact'])]
class Favorite
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['favorite:read'])]
    private ?int $id = null;

    #[ORM\Column]
    #[Groups(['favorite:read', 'favorite:write'])]
    private ?int $characterId = null;

    #[ORM\Column(length: 255)]
    #[Groups(['favorite:read', 'favorite:write'])]
    private ?string $name = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['favorite:read', 'favorite:write'])]
    private ?string $portraitPath = null;

    #[ORM\ManyToOne(inversedBy: 'favorites')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['favorite:write'])]
    #[ORM\JoinColumn(nullable: false, onDelete: "CASCADE")]
    private ?User $user = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCharacterId(): ?int
    {
        return $this->characterId;
    }

    public function setCharacterId(int $characterId): static
    {
        $this->characterId = $characterId;

        return $this;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function getPortraitPath(): ?string
    {
        return $this->portraitPath;
    }

    public function setPortraitPath(?string $portraitPath): static
    {
        $this->portraitPath = $portraitPath;

        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;

        return $this;
    }
}
