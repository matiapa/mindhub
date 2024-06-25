from typing import List
from openai import OpenAI
import re
import string
import os
import dotenv

dotenv.load_dotenv()

client = OpenAI(
    api_key=os.environ.get("OPENAI_SECRET_KEY"),
)

def clean_text(text):
    text = text.lower()
    text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
    text = re.sub(r'<.*?>', '', text)
    text = text.translate(str.maketrans('', '', string.punctuation))
    text = re.sub(r'\d+', '', text)
    text = re.sub(r'\n+', '', text)
    
    return text

def predict(texts: List[str]):
    texts = [clean_text(text) for text in texts]
    texts = " \n ".join(texts)

    max_tokens = int(os.environ.get("INFER_GPT_FINETUNED_MAX_TOKENS_PER_USER"))
    if len(texts.split()) > max_tokens:
        texts = " ".join(texts.split()[:max_tokens])

    print(f"Predicting - Word count: {len(texts.split())}")

    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": f"Given the following texts \n\n {texts} \n\n Predict the author BigFive personality",
            }
        ],
        model="ft:gpt-3.5-turbo-0125:personal:bigfive-disc:9bBdDQuj",
        max_tokens=50,
        temperature=0
    )
    response = chat_completion.choices[0].message.content
    # response = "O: 5 C: 4 E: 3 A: 4 N: 2"
    
    print("Response: ", response)

    matches = re.findall(r'\b\d+\b', response)
    return list(map(int, matches))
