import pandas as pd
import json
import re
import string
import random
import seaborn as sns
import matplotlib.pyplot as plt

def clean_text(text):
    text = text.lower()
    text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
    text = re.sub(r'<.*?>', '', text)
    text = text.translate(str.maketrans('', '', string.punctuation))
    text = re.sub(r'\d+', '', text)
    text = re.sub(r'\n+', '', text)
    
    return text

def plot_histogram(corpus):
    fig, axs = plt.subplots(2, 3, figsize=(15, 10))  # Create a figure with 2x3 subplots
    traits = ['O', 'C', 'E', 'A', 'N']
    for i in range(2):
        for j in range(3):
            if i*3 + j < len(traits):  # Check if there is a trait to plot
                trait = traits[i*3 + j]
                values = [data['personality'][trait] for data in corpus]
                sns.histplot(values, kde=True, ax=axs[i, j])  # Plot on the current subplot
                axs[i, j].set_title(trait)
    plt.tight_layout()  # Adjust the layout so that the plots do not overlap
    plt.show()

# --------------------------------------------------------------------------------------

df = pd.read_csv('datasets/mypersonality_posts_9k.csv', encoding='windows-1252')

corpus = {}

for index, row in df.iterrows():
    if row['#AUTHID'] not in corpus:
        corpus[row['#AUTHID']] = {
            "texts": "",
            "word_count": 0,
            "personality": {
                "E": round(row['sEXT']),
                "A": round(row['sAGR']),
                "C": round(row['sCON']),
                "N": round(row['sNEU']),
                "O": round(row['sOPN'])
            }
        }
    
    if corpus[row['#AUTHID']]["word_count"] > 1000:
        continue

    text = clean_text(row['STATUS'])
    word_count = len(text.split())

    if word_count < 5:
        continue

    corpus[row['#AUTHID']]["texts"] += f"{text} \n "
    corpus[row['#AUTHID']]["word_count"] += word_count

# Make a histogram for each personality trait using Seaborn

corpus = list(corpus.values())
#plot_histogram(corpus)
print(len(corpus))

corpus = list(filter(lambda x: x["word_count"] > 100, corpus))
#plot_histogram(corpus)
print(len(corpus))

random.shuffle(corpus)
train_set = corpus[:150]
test_set = corpus[150:170]

# --------------------------------------------------------------------------------------

with open('models/gpt-tune/data/fine_tuning_disc_train.jsonl', 'w') as f:
    for data in train_set:
        sample = {
            "messages": [
                {
                    "role": "user",
                    "content": f"Given the following texts \n\n {data['texts']} \n\n Predict the author BigFive personality",
                },
                {
                    "role": "assistant",
                    "content": f"O: {data['personality']['O']} C: {data['personality']['C']} E: {data['personality']['E']} A: {data['personality']['A']} N: {data['personality']['N']}"
                }
            ],
        }
        f.write(json.dumps(sample) + '\n')

with open('models/gpt-tune/data/fine_tuning_disc_test.jsonl', 'w') as f:
    for data in test_set:
        sample = {
            "messages": [
                {
                    "role": "user",
                    "content": f"Given the following texts \n\n {data['texts']} \n\n Predict the author BigFive personality",
                },
                {
                    "role": "assistant",
                    "content": f"O: {data['personality']['O']} C: {data['personality']['C']} E: {data['personality']['E']} A: {data['personality']['A']} N: {data['personality']['N']}"
                }
            ],
        }
        f.write(json.dumps(sample) + '\n')
