<?php

namespace App\Service;

use Symfony\Contracts\HttpClient\Exception\ClientExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\DecodingExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\RedirectionExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\ServerExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

readonly class ApiConnect
{
    /**
     * @throws TransportExceptionInterface
     * @throws ServerExceptionInterface
     * @throws RedirectionExceptionInterface
     * @throws DecodingExceptionInterface
     * @throws ClientExceptionInterface
     */
    public function __construct(private HttpClientInterface $client, private string $apiUrl){
        setcookie('token', $this->getToken('louis.fremeaux@icloud.com','loulou'),['httpOnly'=>true,'expires'=>time()+60]);

    }

    /**
     * @throws TransportExceptionInterface
     * @throws ServerExceptionInterface
     * @throws RedirectionExceptionInterface
     * @throws DecodingExceptionInterface
     * @throws ClientExceptionInterface
     */
    private function getToken(string $user, string $password): string
    {
        return $this->client->request('POST', $this->apiUrl.'/api/login',['json'=>['email'=>$user,'password'=>$password]])->toArray()['token'];
    }
    private function path(string $path): string
    {
        if (!str_starts_with($path,"/")){
            $path = '/'.$path;
        }
        return $path;
    }
    /**
     * @throws TransportExceptionInterface
     * @throws ServerExceptionInterface
     * @throws RedirectionExceptionInterface
     * @throws DecodingExceptionInterface
     * @throws ClientExceptionInterface
     */
    public function get(string $endpoint): array
    {
        $endpoint=$this->path($endpoint);
        return $this->client->request('GET', $this->apiUrl.$endpoint,['headers' => ['Authorization' => 'Bearer '.$_COOKIE['token']]])->toArray();
    }

    public function post(string $endpoint): array
    {
        //TODO post function
        //return $this->client->request('GET', $this->apiUrl.$endpoint,['headers' => ['Authorization' => 'Bearer '.$this->token]])->toArray();
        return [$endpoint];
    }
    public function patch(string $endpoint): array
    {
        //TODO patch function
        //return $this->client->request('GET', $this->apiUrl.$endpoint,['headers' => ['Authorization' => 'Bearer '.$this->token]])->toArray();
        return [$endpoint];
    }
    public function delete(string $endpoint): array
    {
        //TODO delete function
        //return $this->client->request('GET', $this->apiUrl.$endpoint,['headers' => ['Authorization' => 'Bearer '.$this->token]])->toArray();
        return [$endpoint];
    }
}
