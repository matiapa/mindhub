import os
import sys
parent_dir = os.path.dirname(os.getcwd())
sys.path.insert(0, f"{os.getcwd()}/src/models/bert_mlp")

import numpy as np
import pandas as pd
import torch
from torch.utils.data import Dataset
from tqdm import tqdm

from preprocess.preprocess import preprocess_text


def load_dataset(datafiles, tokenizer, token_length):
    targets = []
    input_ids = []
    attention_masks = []

    # Load the data files

    print(">> Loading files...")
    dfs = map(lambda x: pd.read_csv(x), datafiles)
    df = pd.concat(dfs, ignore_index=True)
    df.drop_duplicates(inplace=True)

    # Tokenize each text and make the (inputs, target) tuples

    print(">> Preprocessing texts and tokenizing...")
    for i in tqdm(range(len(df)), desc=">>>"):
        print("Original text: ", df["text"][i])
        text = preprocess_text(df["text"][i])
        print("Preprocessed text: ", text)
        tokens = tokenizer.tokenize(text)

        # Convert the tokens to their IDs
        tokens_ids = tokenizer.encode(
            tokens,
            add_special_tokens=True,
            max_length=token_length,
            padding="max_length",
            truncation=True,
        )

        # Create an attention mask to ignore padding tokens
        attention_mask = [1 if token_id != 0 else 0 for token_id in tokens_ids]
        attention_masks.append(attention_mask)

        input_ids.append(tokens_ids)

        targets.append(
            [df["O"][i], df["C"][i], df["E"][i], df["A"][i], df["N"][i]]
        )
    
    return input_ids, attention_masks, targets


class TorchDatasetMap(Dataset):
    def __init__(self, datafiles, tokenizer, token_length, DEVICE):
        input_ids, attention_masks, targets = load_dataset(datafiles, tokenizer, token_length)

        input_ids = torch.from_numpy(np.array(input_ids)).long().to(DEVICE)
        attention_masks = torch.from_numpy(np.array(attention_masks)).long().to(DEVICE)
        targets = torch.from_numpy(np.array(targets)).long().to(DEVICE)

        self.input_ids = input_ids
        self.attention_maks = attention_masks
        self.targets = targets

    def __len__(self):
        return len(self.targets)

    def __getitem__(self, idx):
        return (self.input_ids[idx], self.attention_maks[idx], self.targets[idx])
