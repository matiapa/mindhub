import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
import numpy as np
import pickle
import time
from datetime import timedelta

import torch
from torch.utils.data import DataLoader, Dataset
from transformers import *

import models.bert_mlp.training.utils as utils
from models.bert_mlp.training.data_utils import MyMapDataset
import sys
from pathlib import Path

sys.path.insert(0, os.getcwd())

start = time.time()

if torch.cuda.is_available():
    DEVICE = torch.device("cuda")
    print("GPU found (", torch.cuda.get_device_name(torch.cuda.current_device()), ")")
    torch.cuda.set_device(torch.cuda.current_device())
    print("num device avail: ", torch.cuda.device_count())
else:
    DEVICE = torch.device("cpu")
    print("running on cpu")


def extract_bert_features(input_ids, n_hl):
    tmp = []
    bert_output = model(input_ids)

    for ii in range(n_hl):
        tmp.append(bert_output[2][ii + 1][:, 0, :].cpu().numpy())

    hidden_features.append(np.array(tmp))
    return hidden_features
        

def get_embedding_model(embedding_model):
    # * Model          | Tokenizer          | Pretrained weights shortcut
    # MODEL=(DistilBertModel, DistilBertTokenizer, 'distilbert-base-uncased')
    if embedding_model == "bert-base":
        n_hl = 12
        hidden_dim = 768
        MODEL = (BertModel, BertTokenizer, "bert-base-uncased")

    elif embedding_model == "bert-large":
        n_hl = 24
        hidden_dim = 1024
        MODEL = (BertModel, BertTokenizer, "bert-large-uncased")

    elif embedding_model == "albert-base":
        n_hl = 12
        hidden_dim = 768
        MODEL = (AlbertModel, AlbertTokenizer, "albert-base-v2")

    elif embedding_model == "albert-large":
        n_hl = 24
        hidden_dim = 1024
        MODEL = (AlbertModel, AlbertTokenizer, "albert-large-v2")

    model_class, tokenizer_class, pretrained_weights = MODEL

    # load the LM model and tokenizer from the HuggingFace Transformers library
    model = model_class.from_pretrained(
        pretrained_weights, output_hidden_states=True
    )  # output_attentions=False
    tokenizer = tokenizer_class.from_pretrained(pretrained_weights, do_lower_case=True)

    return model, tokenizer, n_hl, hidden_dim


if __name__ == "__main__":
    # argument extractor
    (
        dataset,
        token_length,
        batch_size,
        embed,
        pkl_dir,
        mode,
        embed_mode,
    ) = utils.parse_args_extractor()
    print(
        "\n{} | {} | {} | {}\n".format(
            embed, token_length, mode, embed_mode
        )
    )
    
    # Load the embedding model

    batch_size = int(32)
    model, tokenizer, n_hl, hidden_dim = get_embedding_model(embed)
    if DEVICE == torch.device("cuda"):
        model = model.cuda()
        print("\ngpu mem alloc: ", round(torch.cuda.memory_allocated() * 1e-9, 2), " GB" )

    # Load the preprocessed dataset

    map_dataset = MyMapDataset(tokenizer, token_length, DEVICE, mode)
    data_loader = DataLoader(dataset=map_dataset, batch_size=batch_size, shuffle=False,)

    # Extract the embeddings from the dataset

    print("Starting to extract LM embeddings...")

    hidden_features = []
    all_targets = []
    all_author_ids = []

    for author_ids, input_ids, targets in data_loader:
        with torch.no_grad():
            all_targets.append(targets.cpu().numpy())
            all_author_ids.append(author_ids.cpu().numpy())
            extract_bert_features(input_ids, n_hl)

    # Store the embeddings in a pickle file

    Path(pkl_dir).mkdir(parents=True, exist_ok=True)
    pkl_file_name = dataset + "-" + embed + "-" + embed_mode + "-" + mode + ".pkl"

    file = open(os.path.join(pkl_dir, pkl_file_name), "wb")
    pickle.dump(zip(all_author_ids, hidden_features, all_targets), file)
    file.close()

    print("Extracting embeddings for {} dataset: DONE!".format(dataset))
