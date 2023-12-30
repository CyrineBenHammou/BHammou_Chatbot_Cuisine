from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
#from textblob import TextBlob
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
import string
import openai  

# Create a FastAPI instance
app = FastAPI()

# here we are hosting the frontend part of our project, and providing the assets files with fastapi server
app.mount("/frontend", StaticFiles(directory="../FRONTEND", html = True), name="frontend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def analyse_text(texte:str):
    mot_cle=nltk.word_tokenize(texte)
    return {"sujet":"vide","sentiment":[],"mot_cles":mot_cle}

def generer_reponse(text:str):
    return {"reponse":"reponse"}

def formeter_reponse(text:str):
    return {"reponse_formater":"reponse vide formater"}


# Define a Pydantic model for the input data
class AnalyseTextInput(BaseModel):
    texte: str

@app.post("/query_openai")
def QueryOpenAI(query:str):
    
    openai.api_key = "#" # has to be replaced with an openai token
    # here we are initializing the openai gpt 3.5 turbo, and providing it with a system prompt to have the expected answers
    client = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
        {"role": "system", "content": "You are a language model assuming the role of a Tunisian chef. Your task is to provide a detailed recipe for a traditional Tunisian dish. Include a list of ingredients, step-by-step instructions for preparation and cooking, and any relevant cultural or historical information about the dish. Additionally, offer tips on presentation and suggestions for side dishes or drink pairings that complement the flavors of the main course. Remember to cater to a global audience, explaining any unique Tunisian ingredients or cooking methods that might be unfamiliar to them."},
        {"role": "user", "content": query}
        ]   
    )   

    response= client['choices'][0]['message']['content']
    return response


@app.post("/recette")
def analyse_endpoint(analyse_input: AnalyseTextInput):

    # Convert to lowercasewer()
    texte = analyse_input.texte.lower()
    # Tokenization of the user input
    tokens = nltk.word_tokenize(texte)
    # Remove stopwords
    stop_words = set(stopwords.words('english'))
    # Remove punctionation 
    punctuation = set(string.punctuation)
    # combining tokens
    tokens = [word for word in tokens if word not in stop_words and word not in punctuation]
    # initialize Lemmatization
    lemmatizer = WordNetLemmatizer()
    # assigning lemminized words
    lemmatized_words = [lemmatizer.lemmatize(word) for word in tokens]
    # Add a space before the additional phrase 
    query = " ".join(lemmatized_words) + " should be Tunisian recipe"

    response =QueryOpenAI(query)
    return {"msg": response}


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)