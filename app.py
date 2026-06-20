import streamlit as st
import pandas as pd
from google import genai
import os
from dotenv import load_dotenv

# Charge les variables d'environnement
load_dotenv(dotenv_path="/Users/martinbrunet-lecomte/Documents/Perso/Documents importants/Foot/.env")

# 1. Configuration de la page et de l'IA
st.set_page_config(page_title="SaaS Pronostics IA", layout="centered")

# Récupération sécurisée de la clé
CLE_API_LLM = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=CLE_API_LLM)

# 2. En-tête de l'interface
st.title("⚽ Tableau de Bord - Pronostics")
st.write("Sélectionnez un match pour générer une analyse tactique.")

# 3. Chargement des données
@st.cache_data # Évite de recharger le CSV à chaque clic
def charger_donnees():
    return pd.read_csv("/Users/martinbrunet-lecomte/Documents/Perso/Documents importants/Foot/matchs_cdm_2022.csv")

try:
    df = charger_donnees()
except FileNotFoundError:
    st.error("Erreur : Le fichier matchs_cdm_2022.csv est introuvable.")
    st.stop()

# 4. Éléments interactifs
liste_matchs = df['domicile'] + " vs " + df['exterieur']
match_choisi = st.selectbox("Choisissez une rencontre :", liste_matchs)

# 5. Le Bouton d'action
if st.button("Générer le scénario du match", type="primary"):
    index_match = liste_matchs[liste_matchs == match_choisi].index[0]
    match = df.iloc[index_match]

    prompt = f"""
    Tu es un expert en analyse tactique de football. Ton but est de fournir un scénario
    probable pour le match suivant, en te basant sur ces données :
    - Domicile : {match['domicile']}
    - Extérieur : {match['exterieur']}
    - Score réel (ne le spoile pas) : {match['score_dom']} - {match['score_ext']}

    Rédige un paragraphe de 4 lignes maximum expliquant quel type de match attendre.
    Garde un ton professionnel et direct.
    """

    with st.spinner("L'IA analyse la rencontre..."):
        reponse = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )

    st.success(f"Analyse terminée pour {match['domicile']} - {match['exterieur']}")
    st.info(reponse.text)