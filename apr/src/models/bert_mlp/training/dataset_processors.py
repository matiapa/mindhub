import numpy as np
import pandas as pd
import re
import csv
import preprocessor as p
import math


def preprocess_text(sentence):
    # remove hyperlinks, hashtags, smileys, emojies
    sentence = p.clean(sentence)
    # Remove hyperlinks
    sentence = re.sub(r"http\S+", " ", sentence)
    # Remove punctuations and numbers
    # sentence = re.sub('[^a-zA-Z]', ' ', sentence)
    # sentence = re.sub('[^a-zA-Z.?!,]', ' ', sentence)
    # Single character removal (except I)
    # sentence = re.sub(r"\s+[a-zA-HJ-Z]\s+", ' ', sentence)
    # Removing multiple spaces
    sentence = re.sub(r"\s+", " ", sentence)
    sentence = re.sub(r"\|\|\|", " ", sentence)

    return sentence


def load_essays_df(datafile):
    with open(datafile, "rt") as csvf:
        csvreader = csv.reader(csvf, delimiter=",", quotechar='"')
        first_line = True
        df = pd.DataFrame(
            columns=["user", "text", "token_len", "EXT", "NEU", "AGR", "CON", "OPN"]
        )
        for line in csvreader:
            if first_line:
                first_line = False
                continue

            text = line[1]
            new_row = pd.DataFrame(
                {
                    "user": [line[0]],
                    "text": [text],
                    "token_len": [0],
                    "EXT": [1 if line[2].lower() == "y" else 0],
                    "NEU": [1 if line[3].lower() == "y" else 0],
                    "AGR": [1 if line[4].lower() == "y" else 0],
                    "CON": [1 if line[5].lower() == "y" else 0],
                    "OPN": [1 if line[6].lower() == "y" else 0],
                }
            )
            df = pd.concat([df, new_row], ignore_index=True)

    print("EXT : ", df["EXT"].value_counts())
    print("NEU : ", df["NEU"].value_counts())
    print("AGR : ", df["AGR"].value_counts())
    print("CON : ", df["CON"].value_counts())
    print("OPN : ", df["OPN"].value_counts())

    return df


def essays_embeddings(datafile, tokenizer, token_length):
    targets = []
    input_ids = []

    df = load_essays_df(datafile)
    cnt = 0

    # sorting all essays in ascending order of their length
    for ind in df.index:
        tokens = tokenizer.tokenize(df["text"][ind])
        df.at[ind, "token_len"] = len(tokens)

    df.sort_values(by=["token_len", "user"], inplace=True, ascending=True)
    tmp_df = df["user"]
    tmp_df.to_csv("data/essays/author_id_order.csv", index_label="order")
    print("Mean length of essay: ", df["token_len"].mean())

    # Tokenize each text and make the (inputs, target) tuples

    for i in range(len(df)):
        text = preprocess_text(df["text"][i])
        tokens = tokenizer.tokenize(text)

        input_ids.append(
            tokenizer.encode(
                tokens,
                add_special_tokens=True,
                max_length=token_length,
                pad_to_max_length=True,
            )
        )

        targets.append(
            [df["EXT"][i], df["NEU"][i], df["AGR"][i], df["CON"][i], df["OPN"][i]]
        )

        cnt += 1

    author_ids = np.array(df.index)
    print("loaded all input_ids and targets from the data file!")
    return author_ids, input_ids, targets
