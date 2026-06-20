import pandas as pd
from google import genai
import os
from dotenv import load_dotenv

# Charge les variables d'environnement
load_dotenv(dotenv_path="/Users/martinbrunet-lecomte/Documents/Perso/Documents importants/Foot/.env")

# 1. Configuration de l'IA sécurisée
CLE_API_LLM = os.getenv("GEMINI_API_KEY") # <-- CLÉ SÉCURISÉE ICI
client = genai.Client(api_key=CLE_API_LLM)



def creer_prompt_pour_match(match):
    """
    Cette fonction prend les données brutes et construit la consigne stricte pour l'IA.
    """
    prompt = f"""
    Tu es un expert en analyse tactique de football. Ton but est de fournir un scénario
    probable pour le match suivant, en te basant sur ces données réelles :

    - Équipe à domicile : {match['domicile']}
    - Équipe à l'extérieur : {match['exterieur']}
    - Score final réel (pour ton contexte interne, ne le spoile pas comme une certitude dans ton analyse) : {match['score_dom']} - {match['score_ext']}

    Rédige un paragraphe de 4 lignes maximum expliquant quel type de match les spectateurs
    doivent attendre (possession, contre-attaque, défense serrée) en fonction du profil de ces deux équipes.
    Garde un ton professionnel et direct.
    """
    return prompt

def generer_analyse():
    """
    Fonction principale qui orchestre la lecture et l'appel à l'API.
    """
    try:
        df = pd.read_csv("matchs_cdm_2022.csv")
    except FileNotFoundError:
        print("Erreur : Le fichier CSV est introuvable.")
        return

    # On isole la première ligne du tableau (Qatar vs Ecuador)
    premier_match = df.iloc[0]

    # On génère le texte de consigne
    consigne = creer_prompt_pour_match(premier_match)
    print("--- Envoi de la requête à l'IA en cours... ---\n")

    # 2. Appel à l'API (Nouvelle syntaxe et modèle récent)
    reponse = client.models.generate_content(
        model='gemini-2.5-flash', # On utilise un modèle à jour
        contents=consigne
    )

    print(f"Match analysé : {premier_match['domicile']} vs {premier_match['exterieur']}\n")
    print("Scénario généré par l'IA :")
    print(reponse.text)

# Lancement du script
generer_analyse()