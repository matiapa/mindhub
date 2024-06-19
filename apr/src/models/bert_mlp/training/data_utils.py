import numpy as np
import pandas as pd
import re
import csv
import preprocessor as p
from torch.utils.data import DataLoader, Dataset
import torch
from transformers import *
import math

import models.bert_mlp.training.dataset_processors as dataset_processors


class MyMapDataset(Dataset):
    def __init__(self, tokenizer, token_length, DEVICE, mode):
        datafile = "data/essays/essays.csv"
        author_ids, input_ids, targets = dataset_processors.essays_embeddings(
            datafile, tokenizer, token_length, mode
        )

        author_ids = torch.from_numpy(np.array(author_ids)).long().to(DEVICE)
        input_ids = torch.from_numpy(np.array(input_ids)).long().to(DEVICE)
        targets = torch.from_numpy(np.array(targets)).long().to(DEVICE)

        self.author_ids = author_ids
        self.input_ids = input_ids
        self.targets = targets

    def __len__(self):
        return len(self.targets)

    def __getitem__(self, idx):
        return (self.author_ids[idx], self.input_ids[idx], self.targets[idx])
