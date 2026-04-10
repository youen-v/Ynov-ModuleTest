# DOCUMENTATION GLOBALE -- MODULE DE TEST

Groupe : Youen VALUN, Julien PRADIER, Julie LECHARTIER


## Présentation du projet

Dans le cadre de ce projet, nous avons mis en place une architecture permettant de déployer automatiquement une application basée sur des microservices sur AWS.
L’objectif principal était de construire une chaîne de déploiement entièrement automatisée, sans intervention manuelle sur les serveurs

## Infrastructure AWS

Le projet utilise AWS avec deux instances EC2 :

### 1. Serveur Registry Docker

Ce serveur héberge un registre Docker privé.

Il permet de stocker et distribuer les images Docker utilisées par l’application.

### 2. Serveur Applicatif

Ce serveur héberge l’application.

Il est recréé à chaque déploiement.

Il contient :

Docker
Docker Compose
l’application complète

## Fonctionnement du déploiement

Le déploiement est entièrement automatisé via GitHub Actions.

Étapes :

Build des images Docker
Push vers le registre privé
Création des serveurs avec Terraform
Récupération des informations (IP + clé SSH)
Configuration du serveur avec Ansible
Lancement de l’application avec Docker Compose
Test de l’API et du frontend

## Outils utilisés
Terraform : création de l’infrastructure
Ansible : configuration des serveurs
Docker / Docker Compose : déploiement de l’application
GitHub Actions : pipeline CI/CD
AWS EC2 : hébergement


Le projet permet de :

déployer une infrastructure complète automatiquement
installer et configurer les serveurs sans intervention humaine
accéder à l’application via une IP publique
