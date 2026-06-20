import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from dotenv import load_dotenv
import pandas as pd
import requests
from datetime import datetime
from scipy.stats import poisson
from supabase import create_client, Client

# ==========================================
# 1. INITIALISATION DE L'ENVIRONNEMENT & API
# ==========================================
load_dotenv(dotenv_path="/Users/martinbrunet-lecomte/Documents/Perso/Documents importants/Foot/.env")

# --- INITIALISATION SUPABASE ---
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

if not supabase_url or not supabase_key:
    print("⚠️ ALERTE : Les clés Supabase ne sont pas trouvées dans le .env !")
    supabase = None
else:
    print("✅ Connexion à Supabase établie !")
    supabase: Client = create_client(supabase_url, supabase_key)

# --- INITIALISATION GEMINI & API-SPORTS ---
cle_api = os.getenv("GEMINI_API_KEY")
api_sports_key = os.getenv("API_SPORTS_KEY")

if not api_sports_key:
    print("⚠️ ALERTE : La clé API_SPORTS_KEY n'a pas été trouvée dans le .env !")

# Nouvelle syntaxe Google GenAI
if not cle_api:
    print("⚠️ ALERTE : La clé API GEMINI n'a pas été trouvée dans le fichier .env !")
    gemini_client = None
else:
    print("✅ Clé API Gemini trouvée avec succès ! Initialisation du client...")
    gemini_client = genai.Client(api_key=cle_api)

# ==========================================
# 2. FONCTIONS DE BASE DE DONNÉES (SUPABASE)
# ==========================================
def sauvegarder_prediction(match_id, home, away, details, predicted_bet, odds_taken):
    if not supabase:
        print("⚠️ Supabase non configuré, sauvegarde annulée.")
        return
    try:
        data, count = supabase.table('predictions').insert({
            "match_id": match_id,
            "home_team": home,
            "away_team": away,
            "prediction_details": details,
            "predicted_bet": predicted_bet,
            "odds_taken": odds_taken,
            "status": "PENDING"
        }).execute()
        print(f"✅ Prédiction sauvegardée sur Supabase (Match: {match_id})")
    except Exception as e:
        print(f"⚠️ Erreur lors de la sauvegarde Supabase : {e}")

def calculer_pnl(predicted_bet: str, resultat_reel: str, odds_taken: float) -> float:
    if not predicted_bet or not odds_taken:
        return 0.0
    if predicted_bet == resultat_reel:
        return round(odds_taken - 1.0, 2)
    else:
        return -1.0

def cloturer_match(match_id: int, resultat_reel: str):
    if not supabase:
        return
    try:
        response = supabase.table('predictions').select('predicted_bet, odds_taken').eq('match_id', match_id).eq('status', 'PENDING').execute()

        if response.data:
            prediction = response.data[0]
            predicted_bet = prediction.get('predicted_bet')
            odds_taken = prediction.get('odds_taken')

            pnl = calculer_pnl(predicted_bet, resultat_reel, odds_taken)

            supabase.table('predictions').update({
                'resultat_reel': resultat_reel,
                'pnl': pnl,
                'status': 'FINISHED'
            }).eq('match_id', match_id).execute()

            print(f"✅ Match {match_id} clôturé sur Supabase ! Résultat: {resultat_reel} | PnL: {pnl}")
        else:
            print(f"ℹ️ Aucune prédiction en attente trouvée pour le match {match_id}.")

    except Exception as e:
        print(f"⚠️ Erreur lors de la clôture sur Supabase : {e}")

# ==========================================
# 3. INITIALISATION DE L'APPLICATION FASTAPI
# ==========================================
app = FastAPI(
    title="Football AI Prediction API",
    description="Backend FastAPI pour l'analyse de matchs avec Gemini et Supabase",
    version="1.0.0"
)

# ==========================================
# 4. CONFIGURATION DES CORS (Pour Lovable)
# ==========================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# 5. MODÈLES DE DONNÉES (Pydantic)
# ==========================================
class MatchSimple(BaseModel):
    match_id: int
    team_home: str
    team_away: str
    competition: str
    heure: str
    logo_home: str | None = None
    logo_away: str | None = None

class MatchRequest(BaseModel):
    match_id: int
    team_home: str
    team_away: str

class MatchResponse(BaseModel):
    match_id: int
    gender: str
    prob_home: int
    prob_draw: int
    prob_away: int
    odd_home: float
    odd_draw: float
    odd_away: float
    edge_home: float
    edge_draw: float
    edge_away: float
    value_bet_home: bool
    value_bet_draw: bool
    value_bet_away: bool
    lineups: dict | None = None
    analysis_markdown: str

# ==========================================
# 6. MOTEUR ALGORITHMIQUE
# ==========================================
def detect_gender(league_name: str) -> str:
    women_keywords = ['women', 'féminin', 'feminin', 'frauen', 'mujeres', 'donna', 'femenino']
    if any(keyword in league_name.lower() for keyword in women_keywords):
        return "Équipe Féminine"
    return "Équipe Masculine"

def calculer_probabilites_1x2(lambda_dom: float, lambda_ext: float):
    prob_home = 0.0
    prob_draw = 0.0
    prob_away = 0.0
    for buts_dom in range(10):
        for buts_ext in range(10):
            prob_score = poisson.pmf(buts_dom, lambda_dom) * poisson.pmf(buts_ext, lambda_ext)
            if buts_dom > buts_ext:
                prob_home += prob_score
            elif buts_dom == buts_ext:
                prob_draw += prob_score
            else:
                prob_away += prob_score
    return prob_home, prob_draw, prob_away

def recuperer_cotes_1x2(match_id: int):
    url = "https://v3.football.api-sports.io/odds"
    headers = {"x-apisports-key": api_sports_key}
    querystring = {"fixture": match_id, "bookmaker": "8"}
    cotes = {"home": 2.10, "draw": 3.00, "away": 3.20}
    try:
        response = requests.get(url, headers=headers, params=querystring)
        response.raise_for_status()
        data = response.json()
        if data.get('response'):
            bookmakers = data['response'][0].get('bookmakers', [])
            if bookmakers:
                bets = bookmakers[0].get('bets', [])
                for bet in bets:
                    if bet['id'] == 1:
                        for value in bet['values']:
                            if value['value'] == 'Home': cotes["home"] = float(value['odd'])
                            elif value['value'] == 'Draw': cotes["draw"] = float(value['odd'])
                            elif value['value'] == 'Away': cotes["away"] = float(value['odd'])
    except Exception as e:
        print(f"⚠️ Erreur cotes (match {match_id}): {e}")
    return cotes

def recuperer_compositions(match_id: int):
    url = "https://v3.football.api-sports.io/fixtures/lineups"
    headers = {"x-apisports-key": api_sports_key}
    querystring = {"fixture": match_id}
    try:
        response = requests.get(url, headers=headers, params=querystring)
        response.raise_for_status()
        data = response.json()
        if data.get('response') and len(data['response']) > 0:
            return {"teams": data['response']}
    except Exception as e:
        print(f"⚠️ Erreur compositions (match {match_id}): {e}")
    return None

def calculer_xg_dynamiques(match_id: int) -> tuple[float, float]:
    url_fixtures = "https://v3.football.api-sports.io/fixtures"
    url_stats = "https://v3.football.api-sports.io/teams/statistics"
    headers = {"x-apisports-key": api_sports_key}
    lambda_home = 1.4
    lambda_away = 1.1
    try:
        res_fixture = requests.get(url_fixtures, headers=headers, params={"id": match_id})
        data_fixture = res_fixture.json()['response'][0]
        league_id = data_fixture['league']['id']
        season = data_fixture['league']['season']
        team_h_id = data_fixture['teams']['home']['id']
        team_a_id = data_fixture['teams']['away']['id']

        def analyser_equipe(team_id, is_home):
            res_stats = requests.get(url_stats, headers=headers, params={"league": league_id, "season": season, "team": team_id})
            stats = res_stats.json().get('response')
            if not stats: return 1.2
            lieu = "home" if is_home else "away"
            avg_goals_str = stats['goals']['for']['average'][lieu]
            socle_xg = float(avg_goals_str) if avg_goals_str else 1.2
            forme_str = stats.get('form', '')
            if not forme_str: return socle_xg
            derniers_matchs = forme_str[-5:]
            poids_forme = sum([1.2 if r == 'W' else 1.0 if r == 'D' else 0.8 for r in derniers_matchs])
            coeff_momentum = poids_forme / len(derniers_matchs) if derniers_matchs else 1.0
            return min(max(socle_xg * coeff_momentum, 0.5), 3.5)

        lambda_home = analyser_equipe(team_h_id, is_home=True)
        lambda_away = analyser_equipe(team_a_id, is_home=False)
    except Exception as e:
        print(f"⚠️ Erreur xG dynamiques (match {match_id}): {e}")
    return lambda_home, lambda_away

# ==========================================
# 7. ROUTES DE L'API
# ==========================================
@app.get("/api/matches/today", response_model=list[MatchSimple])
async def get_today_matches():
    date_du_jour = datetime.now().strftime("%Y-%m-%d")
    url = "https://v3.football.api-sports.io/fixtures"
    headers = {"x-apisports-key": api_sports_key}
    querystring = {"date": date_du_jour}
    try:
        response = requests.get(url, headers=headers, params=querystring)
        response.raise_for_status()
        data = response.json()
        liste_matchs = []
        for match in data.get('response', []):
            if match['fixture']['status']['short'] in ['NS', 'TBD', '1H', '2H', 'HT', 'FT', 'AET', 'PEN']:
                heure_formatee = match['fixture']['date'].split('T')[1][:5]
                url_logo_home = match['teams']['home'].get('logo')
                url_logo_away = match['teams']['away'].get('logo')
                liste_matchs.append(MatchSimple(
                    match_id=match['fixture']['id'],
                    team_home=match['teams']['home']['name'],
                    team_away=match['teams']['away']['name'],
                    competition=match['league']['name'],
                    heure=heure_formatee,
                    logo_home=url_logo_home,
                    logo_away=url_logo_away
                ))
        return liste_matchs
    except Exception as e:
        print(f"Erreur matchs du jour : {e}")
        return []

@app.get("/api/matches/{match_id}")
async def get_single_match_with_analysis(match_id: int):
    url = "https://v3.football.api-sports.io/fixtures"
    headers = {"x-apisports-key": api_sports_key}
    querystring = {"id": match_id}

    try:
        response = requests.get(url, headers=headers, params=querystring)
        data = response.json()

        if not data.get('response'):
            return {"error": "Match introuvable sur API-Sports"}

        match_info = data['response'][0]
        team_home = match_info['teams']['home']['name']
        team_away = match_info['teams']['away']['name']
        logo_home = match_info['teams']['home']['logo']
        logo_away = match_info['teams']['away']['logo']
        competition = match_info['league']['name']
        heure = match_info['fixture']['date'].split('T')[1][:5]
        genre = detect_gender(competition)

        request_data = MatchRequest(match_id=match_id, team_home=team_home, team_away=team_away)
        analyse = await analyze_match(request_data)

        analyse.gender = genre

        resultat_final = analyse.dict()
        resultat_final.update({
            "team_home": team_home,
            "team_away": team_away,
            "logo_home": logo_home,
            "logo_away": logo_away,
            "competition": competition,
            "heure": heure,
            "gender": genre
        })

        return resultat_final

    except Exception as e:
        print(f"Erreur lors de la récupération du match {match_id}: {e}")
        return {"error": str(e)}

@app.post("/api/analyze", response_model=MatchResponse)
async def analyze_match(request: MatchRequest):
    lambda_home, lambda_away = calculer_xg_dynamiques(request.match_id)
    print(f"📊 xG Calculés par le modèle - Domicile: {lambda_home:.2f} | Extérieur: {lambda_away:.2f}")

    prob_h, prob_d, prob_a = calculer_probabilites_1x2(lambda_home, lambda_away)
    cotes = recuperer_cotes_1x2(request.match_id)

    edge_h = (prob_h * cotes["home"]) - 1
    edge_d = (prob_d * cotes["draw"]) - 1
    edge_a = (prob_a * cotes["away"]) - 1

    lineups_data = recuperer_compositions(request.match_id)

    if lineups_data is None:
        lineups_data = {
            "teams": [
                {
                    "team": {"name": request.team_home},
                    "formation": "4-3-3",
                    "startXI": [
                        {"player": {"name": "Gardien", "number": 1, "grid": "1:1"}},
                    ]
                },
                {
                    "team": {"name": request.team_away},
                    "formation": "4-4-2",
                    "startXI": [
                        {"player": {"name": "Gardien", "number": 1, "grid": "1:1"}},
                    ]
                }
            ]
        }

    prompt = (
        f"Tu es un expert en tactique de football.\n"
        f"Rédige une analyse tactique concise pour le match : {request.team_home} vs {request.team_away}.\n\n"
        f"Probabilités : {request.team_home} ({int(prob_h*100)}%), Nul ({int(prob_d*100)}%), {request.team_away} ({int(prob_a*100)}%)\n"
        f"Cotes : 1 ({cotes['home']}), X ({cotes['draw']}), 2 ({cotes['away']})\n\n"
        f"Fais un focus sur l'opposition au milieu et les transitions. Reste factuel."
    )

    try:
        if gemini_client:
            # Nouvelle syntaxe pour la génération de contenu
            response = gemini_client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt
            )
            analyse_texte = response.text
        else:
            analyse_texte = "Erreur : Client IA non initialisé."
    except Exception as e:
        analyse_texte = "Indisponible."

    # --- DÉTERMINER LE MEILLEUR VALUE BET POUR LA BDD ---
    best_bet = None
    best_odds = 0.0
    max_edge = max(edge_h, edge_d, edge_a)

    if max_edge > 0:
        if max_edge == edge_h:
            best_bet = "1"
            best_odds = cotes["home"]
        elif max_edge == edge_d:
            best_bet = "X"
            best_odds = cotes["draw"]
        else:
            best_bet = "2"
            best_odds = cotes["away"]

    # Sauvegarde dans la BDD Supabase
    sauvegarder_prediction(
        request.match_id,
        request.team_home,
        request.team_away,
        analyse_texte,
        best_bet,
        best_odds
    )

    return MatchResponse(
        match_id=request.match_id,
        gender="Non défini", # Sera écrasé par le route appelante
        prob_home=int(prob_h * 100),
        prob_draw=int(prob_d * 100),
        prob_away=int(prob_a * 100),
        odd_home=cotes["home"],
        odd_draw=cotes["draw"],
        odd_away=cotes["away"],
        edge_home=round(edge_h * 100, 2),
        edge_draw=round(edge_d * 100, 2),
        edge_away=round(edge_a * 100, 2),
        value_bet_home=edge_h > 0,
        value_bet_draw=edge_d > 0,
        value_bet_away=edge_a > 0,
        lineups=lineups_data,
        analysis_markdown=analyse_texte
    )

@app.get("/api/test-cloture/{match_id}/{resultat_reel}")
async def test_cloture(match_id: int, resultat_reel: str):
    if resultat_reel not in ["1", "X", "2"]:
        return {"error": "Le résultat doit être '1', 'X', ou '2'"}

    try:
        cloturer_match(match_id, resultat_reel)
        return {
            "success": True,
            "message": f"La fonction de clôture a été exécutée pour le match {match_id} avec le résultat '{resultat_reel}'. Vérifie ta table Supabase !"
        }
    except Exception as e:
        return {"error": str(e)}

# ==========================================
# 8. LANCEMENT DU SERVEUR
# ==========================================
if __name__ == "__main__":
    print("Démarrage du backend (FastAPI)...")
    print("Accès à la documentation : https://foot-app-2.onrender.com/docs")
    uvicorn.run(app, host="127.0.0.1", port=8000)