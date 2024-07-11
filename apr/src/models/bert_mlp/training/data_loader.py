import os
import sys
parent_dir = os.path.dirname(os.getcwd())
sys.path.insert(0, f"{os.getcwd()}/src/models/bert_mlp")

import numpy as np
import pandas as pd
import torch
from torch.utils.data import Dataset
from preprocess.preprocess import preprocess_text


def load_dataset(datafile, tokenizer, token_length):
    targets = []
    input_ids = []

    # Read the data file
    df = pd.read_csv(datafile)

    # Tokenize each text and make the (inputs, target) tuples
    for i in range(len(df)):
        text = preprocess_text(df["text"][i])
        tokens = tokenizer.tokenize(text)

        # Convert the tokens to their IDs
        input_ids.append(
            tokenizer.encode(
                tokens,
                add_special_tokens=True,
                max_length=token_length,
                pad_to_max_length=True,
            )
        )

        targets.append(
            [df["O"][i], df["C"][i], df["E"][i], df["A"][i], df["N"][i]]
        )

    print("Loaded all inputs and targets from the data file")
    
    return input_ids, targets


class TorchDatasetMap(Dataset):
    def __init__(self, datafile, tokenizer, token_length, DEVICE):
        input_ids, targets = load_dataset(datafile, tokenizer, token_length)

        input_ids = torch.from_numpy(np.array(input_ids)).long().to(DEVICE)
        targets = torch.from_numpy(np.array(targets)).long().to(DEVICE)

        self.input_ids = input_ids
        self.targets = targets

    def __len__(self):
        return len(self.targets)

    def __getitem__(self, idx):
        return (self.input_ids[idx], self.targets[idx])
