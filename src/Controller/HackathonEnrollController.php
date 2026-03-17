<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class HackathonEnrollController extends AbstractController
{
    #[Route('/inscription', name: 'app_hackathon_inscription', methods: ['GET'])]
    public function index(): Response
    {
        // Les premières listes (Type, Thèmes) peuvent être servies directement.
        $themes = [
            ['id'=>1,'label'=>'IA / Data'],
            ['id'=>2,'label'=>'Green IT'],
            ['id'=>3,'label'=>'Cyber'],
        ];
        $plateformes = ['Zoom','Google Meet','Teams','Jitsi'];
        // Éventuellement, injecter la base API (si live)
        $apiBase = $_ENV['HACKATHON_API'] ?? null;

        return $this->render('hackathon/inscription.html.twig', [
            'themes' => $themes,
            'plateformes' => $plateformes,
            'api_base' => $apiBase,
        ]);
    }
}
