/**
 * @author Luuxis
 * @license CC-BY-NC 4.0 - https://creativecommons.org/licenses/by-nc/4.0/
 */

'use strict';
const { ipcRenderer } = require('electron');
import { config } from './utils.js';

let dev = process.env.NODE_ENV === 'dev';


class Splash {
    constructor() {
        this.splash = document.querySelector(".splash");
        this.splashMessage = document.querySelector(".splash-message");
        this.splashAuthor = document.querySelector(".splash-author");
        this.message = document.querySelector(".message");
        this.progress = document.querySelector("progress");
        document.addEventListener('DOMContentLoaded', () => this.startAnimation());
    }

    async startAnimation() {
        let splashes = [
            { "message": "Bienvenue Commandant..." },
            { "message": "Préparation du vaisseau..." },
            { "message": "Décollage imminent..." },
            { "message": "Vérification des résultats..." },
            { "message": "Chargement du moteur F. T. L. ..." },
            { "message": "Repli des trains d'atterrissages..." },
            { "message": "Allumage des moteurs..." },
            { "message": "Préparation des capsules..." },
            { "message": "Enfilez votre combinaison..." },
            { "message": "Prêt pour une E. V. A. ..." },
            { "message": "Ajout de modules opérationelles..." },
            { "message": "Pressurisation en cours..." },
            { "message": "En approche de la cible..." },
            { "message": "Décompression terminé..." },
            { "message": "Verouillage du S. A. S. ..." },
            { "message": "Mise en orbite géostationnaire..." },
            { "message": "Entrée atmosphérique imminente..." },
            { "message": "Proposez-nous votre message perso..." },
            { "message": "Activation du pilotage automatique..." },
            { "message": "Désactivation du F. T. S. ..." },
            { "message": "Attachez vos harnais..." },
            { "message": "Test des sous-systèmes..." },
            { "message": "Casque à Oxygen requis..." },
            { "message": "Transmission vers CAPCOM..." },
            { "message": "Ouverture d'un canal sécurisé..." },
            { "message": "Réglage du fuseau horaire..." },
            { "message": "Réception de coordonées..." },
            { "message": "Chargement du BluePrint..." },
            { "message": "Analyse du terrain..." },
            { "message": "Récupération des produits..." },
            { "message": "Systèmes entièrement opérationnels..." },
            { "message": "Initialisation du système..." }
            
            
        ];
        let splash = splashes[Math.floor(Math.random() * splashes.length)];
        this.splashMessage.textContent = splash.message;
        
        await sleep(100);
        document.querySelector("#splash").style.display = "block";
        await sleep(500);
        this.splash.classList.add("opacity");
        await sleep(500);
        this.splash.classList.add("translate");
        this.splashMessage.classList.add("opacity");
        this.splashAuthor.classList.add("opacity");
        this.message.classList.add("opacity");
        await sleep(3000);
        this.maintenanceCheck();
    }

    async maintenanceCheck() {
        if (dev) return this.startLauncher();
        config.GetConfig().then(res => {
            if (res.maintenance) return this.shutdown(res.maintenance_message);
            else this.checkUpdate();
        }).catch(e => {
            console.error(e);
            return this.shutdown("Aucune connexion internet détectée,<br>veuillez réessayer ultérieurement.");
        })
    }

    async checkUpdate() {
        this.setStatus(`recherche d'un nouvelle espace...`);
        ipcRenderer.send('update-app');

        ipcRenderer.on('updateAvailable', () => {
            this.setStatus(`Mise à jour disponible !`);
            this.toggleProgress();
            ipcRenderer.send('start-update');
        })

        ipcRenderer.on('download-progress', (event, progress) => {
            this.setProgress(progress.transferred, progress.total);
        })

        ipcRenderer.on('update-not-available', () => {
            this.startLauncher();
        })
    }


    startLauncher() {
        this.setStatus(`Démarrage du launcher`);
        ipcRenderer.send('main-window-open');
        ipcRenderer.send('update-window-close');
    }

    shutdown(text) {
        this.setStatus(`${text}<br>Arrêt dans 5s`);
        let i = 4;
        setInterval(() => {
            this.setStatus(`${text}<br>Arrêt dans ${i--}s`);
            if (i < 0) ipcRenderer.send('update-window-close');
        }, 1000);
    }

    setStatus(text) {
        this.message.innerHTML = text;
    }

    toggleProgress() {
        if (this.progress.classList.toggle("show")) this.setProgress(0, 1);
    }

    setProgress(value, max) {
        this.progress.value = value;
        this.progress.max = max;
    }
}

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && e.keyCode == 73 || e.keyCode == 123) {
        ipcRenderer.send("update-window-dev-tools");
    }
})
new Splash();