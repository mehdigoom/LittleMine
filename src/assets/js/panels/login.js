/**
 * @author Luuxis
 * @license CC-BY-NC 4.0 - https://creativecommons.org/licenses/by-nc/4.0/
 */

'use strict';

import { database, changePanel, addAccount, accountSelect } from '../utils.js';
const { Mojang } = require('minecraft-java-core');
const { ipcRenderer } = require('electron');

class Login {
    static id = "login";
    async init(config) {
        this.config = config
        this.database = await new database().init();
        if (this.config.online) this.getOnline()
        else this.getOffline()
    }

    getOnline() {
        console.log(`Initializing microsoft Panel...`)
        console.log(`Initializing mojang Panel...`)
        this.loginMicrosoft();
        this.loginMojang();
        document.querySelector('.cancel-login').addEventListener("click", () => {
            document.querySelector(".cancel-login").style.display = "none";
            changePanel("settings");
        })
    }

    getOffline() {

        console.log('verifie login enrengistré: ok ')
if(localStorage.getItem("name")){
    console.log('ID trouver')
    document.getElementById("name").value = localStorage.getItem("name");
    console.log('ID appliqué')
    const pseau = document.getElementById("pseau");
    pseau.style.display = "none"; // Pour le rendre invisible
    
    
    var paragraphe = document.getElementById("slt");
        paragraphe.textContent = "Salut, "+ localStorage.getItem("name") + " !";
 






}
if(localStorage.getItem("discord")){
    console.log('discord trouver')
    document.getElementById("discord").value = localStorage.getItem("discord");
    console.log('discord appliqué')
    console.log('Call discord API')
    const url = 'https://discordapp.com/api/guilds/1079798883342876703/widget.json';

    // Utilisation de l'API Fetch pour récupérer le JSON
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error('Erreur de réseau');
        }
        return response.json(); // Convertit la réponse en JSON
      })
      .then(data => {
        // Faites quelque chose avec les données JSON récupérées
       // console.log(data);
        console.log('REPONSE API OK ')
        function findMemberByUsername(jsonData, username) {
            const member = jsonData.members.find(member => member.username === username);
            return member;
          }
          
          const usernameToFind = localStorage.getItem("discord"); // Nom d'utilisateur du membre que vous souhaitez trouver
          const foundMember = findMemberByUsername(data, usernameToFind);
          
          if (foundMember) {
            const bouton = document.getElementById("discordBTN");
            bouton.style.display = "none"; // Pour le rendre invisible
            const discordCHAMP = document.getElementById("discord");
            discordCHAMP.style.display = "none"; // Pour le rendre invisible
            const discordTXT = document.getElementById("discordTXT");
            discordTXT.style.display = "none"; // Pour le rendre invisible
            const discordMSG = document.getElementById("msg");
            discordMSG.style.display = "none"; // Pour le rendre invisible
            const disc= document.getElementById("disc");
            disc.style.display = "none"; // Pour le rendre invisible


            console.log("Membre trouvé :");
            console.log("ID : " + foundMember.id);
            console.log("Username : " + foundMember.username);
            console.log("Discriminator : " + foundMember.discriminator);

          } else {
            console.log("Membre non trouvé.");
            const bouton = document.getElementById("Bouton");
            bouton.style.display = "none"; // Pour le rendre invisible
            localStorage.removeItem("discord")
            const paragraph = document.getElementById('msg');
            paragraph.textContent = 'Tu es pas sur notre discord ! rejoin nous pour pouvoir jouer !';
          }




      })
      .catch(error => {
        console.log('API ERREUR API ')
        console.error('Erreur :', error);
      });
      console.log('Fin call API ')
} else{

    const bouton = document.getElementById("Bouton");
    bouton.style.display = "none"; // Pour le rendre invisible
}



        console.log(`Initializing microsoft Panel...`)
        console.log(`Initializing mojang Panel...`)
        console.log(`Initializing offline Panel...`)
        this.loginMicrosoft();
        this.loginOffline();
        document.querySelector('.cancel-login').addEventListener("click", () => {
            document.querySelector(".cancel-login").style.display = "none";
            changePanel("settings");
        })
    }

    loginMicrosoft() {
        let microsoftBtn = document.querySelector('.microsoft')
        let mojangBtn = document.querySelector('.mojang')
        let cancelBtn = document.querySelector('.cancel-login')

        microsoftBtn.addEventListener("click", () => {
            microsoftBtn.disabled = true;
            mojangBtn.disabled = true;
            cancelBtn.disabled = true;
            ipcRenderer.invoke('Microsoft-window', this.config.client_id).then(account_connect => {
                if (!account_connect) {
                    microsoftBtn.disabled = false;
                    mojangBtn.disabled = false;
                    cancelBtn.disabled = false;
                    return;
                }

                let account = {
                    access_token: account_connect.access_token,
                    client_token: account_connect.client_token,
                    uuid: account_connect.uuid,
                    name: account_connect.name,
                    refresh_token: account_connect.refresh_token,
                    user_properties: account_connect.user_properties,
                    meta: account_connect.meta
                }

                let profile = {
                    uuid: account_connect.uuid,
                    skins: account_connect.profile.skins || [],
                    capes: account_connect.profile.capes || []
                }

                this.database.add(account, 'accounts')
                this.database.add(profile, 'profile')
                this.database.update({ uuid: "1234", selected: account.uuid }, 'accounts-selected');

                addAccount(account)
                accountSelect(account.uuid)
                changePanel("home");

                microsoftBtn.disabled = false;
                mojangBtn.disabled = false;
                cancelBtn.disabled = false;
                cancelBtn.style.display = "none";
            }).catch(err => {
                console.log(err)
                microsoftBtn.disabled = false;
                mojangBtn.disabled = false;
                cancelBtn.disabled = false;

            });
        })
    }

    async loginMojang() {
        let mailInput = document.querySelector('.Mail')
        let passwordInput = document.querySelector('.Password')
        let cancelMojangBtn = document.querySelector('.cancel-mojang')
        let infoLogin = document.querySelector('.info-login')
        let loginBtn = document.querySelector(".login-btn")
        let mojangBtn = document.querySelector('.mojang')

        mojangBtn.addEventListener("click", () => {
            document.querySelector(".login-card").style.display = "none";
            document.querySelector(".login-card-mojang").style.display = "block";
        })

        cancelMojangBtn.addEventListener("click", () => {
            document.querySelector(".login-card").style.display = "block";
            document.querySelector(".login-card-mojang").style.display = "none";
        })

        loginBtn.addEventListener("click", async () => {
            cancelMojangBtn.disabled = true;
            loginBtn.disabled = true;
            mailInput.disabled = true;
            passwordInput.disabled = true;
            infoLogin.innerHTML = "Connexion en cours...";


            if (mailInput.value == "") {
                infoLogin.innerHTML = "Entrez votre adresse email / Nom d'utilisateur"
                cancelMojangBtn.disabled = false;
                loginBtn.disabled = false;
                mailInput.disabled = false;
                passwordInput.disabled = false;
                return
            }

            if (passwordInput.value == "") {
                infoLogin.innerHTML = "Entrez votre mot de passe"
                cancelMojangBtn.disabled = false;
                loginBtn.disabled = false;
                mailInput.disabled = false;
                passwordInput.disabled = false;
                return
            }

            let account_connect = await Mojang.login(mailInput.value, passwordInput.value)

            if (account_connect == null || account_connect.error) {
                console.log(err)
                cancelMojangBtn.disabled = false;
                loginBtn.disabled = false;
                mailInput.disabled = false;
                passwordInput.disabled = false;
                infoLogin.innerHTML = 'Adresse E-mail ou mot de passe invalide'
                return
            }

            let account = {
                access_token: account_connect.access_token,
                client_token: account_connect.client_token,
                uuid: account_connect.uuid,
                name: account_connect.name,
                user_properties: account_connect.user_properties,
                meta: {
                    type: account_connect.meta.type,
                    offline: account_connect.meta.offline
                }
            }

            this.database.add(account, 'accounts')
            this.database.update({ uuid: "1234", selected: account.uuid }, 'accounts-selected');

            addAccount(account)
            accountSelect(account.uuid)
            changePanel("home");

            cancelMojangBtn.disabled = false;
            cancelMojangBtn.click();
            mailInput.value = "";
            loginBtn.disabled = false;
            mailInput.disabled = false;
            passwordInput.disabled = false;
            loginBtn.style.display = "block";
            infoLogin.innerHTML = "&nbsp;";
        })
    }

    async loginOffline() {
        
        let mailInput = document.querySelector('.Mail')
        let passwordInput = document.querySelector('.Password')
        let cancelMojangBtn = document.querySelector('.cancel-mojang')
        let infoLogin = document.querySelector('.info-login')
        let loginBtn = document.querySelector(".login-btn")
        let mojangBtn = document.querySelector('.mojang')
       
        mojangBtn.innerHTML = "Offline"

        mojangBtn.addEventListener("click", () => {
            document.querySelector(".login-card").style.display = "none";
            document.querySelector(".login-card-mojang").style.display = "block";
        })

        cancelMojangBtn.addEventListener("click", () => {
            document.querySelector(".login-card").style.display = "block";
            document.querySelector(".login-card-mojang").style.display = "none";
        })

        loginBtn.addEventListener("click", async () => {
            cancelMojangBtn.disabled = true;
            loginBtn.disabled = true;
            mailInput.disabled = true;
            passwordInput.disabled = true;
            infoLogin.innerHTML = "Connexion en cours...";


            if (mailInput.value == "") {
                infoLogin.innerHTML = "Entrez votre adresse email / Nom d'utilisateur"
                cancelMojangBtn.disabled = false;
                loginBtn.disabled = false;
                mailInput.disabled = false;
                passwordInput.disabled = false;
                return
            }

            if (mailInput.value.length < 3) {
                infoLogin.innerHTML = "Votre nom d'utilisateur doit avoir au moins 3 caractères"
                cancelMojangBtn.disabled = false;
                loginBtn.disabled = false;
                mailInput.disabled = false;
                passwordInput.disabled = false;
                return
            }

            let account_connect = await Mojang.login(mailInput.value, passwordInput.value)

            if (account_connect == null || account_connect.error) {
                console.log(err)
                cancelMojangBtn.disabled = false;
                loginBtn.disabled = false;
                mailInput.disabled = false;
                passwordInput.disabled = false;
                infoLogin.innerHTML = 'Adresse E-mail ou mot de passe invalide'
                return
            }

            let account = {
                access_token: account_connect.access_token,
                client_token: account_connect.client_token,
                uuid: account_connect.uuid,
                name: account_connect.name,
                user_properties: account_connect.user_properties,
                meta: {
                    type: account_connect.meta.type,
                    offline: account_connect.meta.offline
                }
            }

            this.database.add(account, 'accounts')
            this.database.update({ uuid: "1234", selected: account.uuid }, 'accounts-selected');

            addAccount(account)
            accountSelect(account.uuid)
            changePanel("home");

            cancelMojangBtn.disabled = false;
            cancelMojangBtn.click();
            mailInput.value = "";
            loginBtn.disabled = false;
            mailInput.disabled = false;
            passwordInput.disabled = false;
            loginBtn.style.display = "block";
            infoLogin.innerHTML = "&nbsp;";
        })
    }
}

export default Login;