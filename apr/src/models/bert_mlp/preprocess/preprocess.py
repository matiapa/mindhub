import os
import sys
parent_dir = os.path.dirname(os.getcwd())
sys.path.insert(0, f"{os.getcwd()}/src/models/bert_mlp")

import re
import string
import pandas as pd
import preprocessor
from tqdm import tqdm

from config import config

url_re = re.compile(r'http\S+|www\S+|https\S+')
html_re = re.compile(r'<.*?>')
punctuation_re = re.compile(f'[{re.escape(string.punctuation)}]')
numbers_re = re.compile(r'\d+')
single_char_re = re.compile(r'\s+[a-zA-HJ-Z]\s+')
extra_whitespace_re = re.compile(r'\s+')

def preprocess_text(sentence):
    # Remove hyperlinks, hashtags, smileys, emojies
    sentence = preprocessor.clean(sentence)

    # Remove hyperlinks
    sentence = url_re.sub('', sentence)

    # Remove HTML tags
    sentence = html_re.sub('', sentence)

    # Remove punctuation
    sentence = punctuation_re.sub('', sentence)
    
    # Remove numbers
    sentence = numbers_re.sub('', sentence)

    # Remove single characters (except I)
    sentence = single_char_re.sub(' ', sentence)

    # Remove multiple spaces
    sentence = extra_whitespace_re.sub(' ', sentence)

    return sentence

if __name__ == "__main__":
    dataset_name = config['training']['dataset_name']
    datasets_paths = config['training']['datasets_paths'].split(",")

    dfs = map(lambda x: pd.read_csv(x), datasets_paths)
    df = pd.concat(dfs, ignore_index=True)
    df.drop_duplicates(inplace=True)

    print("> Preprocessing texts...")

    new_df = pd.DataFrame(columns=df.columns)

    for i in tqdm(range(len(df)), desc=">>"):
        text = df.iloc[i]["text"]
        text = preprocess_text(text)

        if len(text) > 0:
            new_df = new_df.add(df.iloc[i])
            new_df.at[i, "text"] = text
    
    new_df.to_csv(f"{dataset_name}-preprocessed.csv", index=False)

    print(f"> Finished preprocessing texts, removed {len(df) - len(new_df)} samples")
