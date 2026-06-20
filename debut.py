import requests
import pandas as pd
import os
from dotenv import load_dotenv

# Charge les variables d'environnement
load_dotenv(dotenv_path="/Users/martinbrunet-lecomte/Documents/Perso/Documents importants/Foot/.env")

url = "https://v3.football.api-sports.io/fixtures"
headers = {
    "x-apisports-key": os.getenv("API_SPORTS_KEY") # <-- CLÉ SÉCURISÉE ICI
}

# ... (garde la suite de ton code intacte)

# On cible la Coupe du Monde (League 1) pour la saison 2022
querystring = {"league": "1", "season": "2022"}

response = requests.get(url, headers=headers, params=querystring)

if response.status_code == 200:
    data = response.json()

    def extraire_infos_match(match):
        return {
            "id": match['fixture']['id'],
            "domicile": match['teams']['home']['name'],
            "exterieur": match['teams']['away']['name'],
            "statut": match['fixture']['status']['short'],
            "score_dom": match['goals']['home'],
            "score_ext": match['goals']['away']
        }

    liste_matchs = []

    # On boucle sur la liste des matchs récupérés
    for match in data.get('response', []):
        liste_matchs.append(extraire_infos_match(match))

    # On transforme en tableau pandas
    df = pd.DataFrame(liste_matchs)

    # On sauvegarde en CSV
# Remplace l'ancienne ligne de sauvegarde par celle-ci :
    df.to_csv("/Users/martinbrunet-lecomte/Documents/Perso/Documents importants/Foot/matchs_cdm_2022.csv", index=False)

    print("Fichier matchs_cdm_2022.csv créé avec succès dans Downloads !")
    print("Fichier matchs_cdm_2022.csv créé avec succès !")
    print(f"Nombre de matchs récupérés : {len(df)}")
    print(df.head()) # Affiche les 5 premières lignes

else:
    print(f"Erreur de connexion : {response.status_code}")