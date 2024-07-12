import os
# os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

import sys
parent_dir = os.path.dirname(os.getcwd())
sys.path.insert(0, f"{os.getcwd()}/src/models/bert_mlp")

import numpy as np
import torch
from torch.utils.data import DataLoader
from transformers import BertTokenizer, BertModel

import pickle
from pathlib import Path

from data_loader import TorchDatasetMap
from config import config


def get_embedding_model(embedding_model):
    MODEL = None

    if embedding_model == "bert-base":
        MODEL = (BertModel, BertTokenizer, "bert-base-uncased")

    elif embedding_model == "bert-large":
        MODEL = (BertModel, BertTokenizer, "bert-large-uncased")

    model_class, tokenizer_class, pretrained_weights = MODEL

    model = model_class.from_pretrained(
        pretrained_weights, output_hidden_states=True
    )
    
    tokenizer = tokenizer_class.from_pretrained(pretrained_weights, do_lower_case=True)

    return model, tokenizer


def extract_bert_features(input_ids, hidden_features):
    tmp = []
    bert_output = model(input_ids)

    print("Inputs shape", input_ids.shape)
    print("Inputs", input_ids)

    hidden_layers = bert_output[2]

    for i in range(n_hl):
        token_embeddings = hidden_layers[i].cpu().numpy()
        # print("Token embeddings shape", token_embeddings.shape)

        # For each text take the mean of all its token embeddings
        tmp.append(token_embeddings.mean(axis=1))

    hidden_features.append(np.array(tmp))


if __name__ == "__main__":    
    pkl_dir = config["pkl_dir"]

    dataset_name = config["training"]["dataset_name"]
    datasets_paths = config["training"]["datasets_paths"]
    batch_size = config["training"]["batch_size"]

    embedding_model = config["embedding"]["model"]
    token_length = config["embedding"]["max_tokens"]
    n_hl = config["embedding"]["hidden_layers"]

    # Detect the running device

    if torch.cuda.is_available():
        DEVICE = torch.device("cuda")
        print("GPU found (", torch.cuda.get_device_name(torch.cuda.current_device()), ")")
        torch.cuda.set_device(torch.cuda.current_device())
        print("Num device avail: ", torch.cuda.device_count())
    else:
        DEVICE = torch.device("cpu")
        print("Running on CPU")

    # Load the embedding model

    print("Loading embedding model...")

    model, tokenizer = get_embedding_model(embedding_model)
    if DEVICE == torch.device("cuda"):
        model = model.cuda()
        print("\nGPU mem alloc: ", round(torch.cuda.memory_allocated() * 1e-9, 2), " GB" )

    # Load the preprocessed dataset

    print("Loading dataset...")

    map_dataset = TorchDatasetMap(datasets_paths.split(","), tokenizer, token_length, DEVICE)
    data_loader = DataLoader(dataset=map_dataset, batch_size=batch_size, shuffle=False)

    # Extract the embeddings from the dataset

    print("Extracting embeddings...")

    hidden_features = []
    all_targets = []

    for input_ids, targets in data_loader:
        with torch.no_grad():
            all_targets.append(targets.cpu().numpy())
            extract_bert_features(input_ids, hidden_features)

    # Store the embeddings in a pickle file

    print("Saving embeddings...")

    Path(pkl_dir).mkdir(parents=True, exist_ok=True)
    file = open(f"{pkl_dir}/embeddings/{dataset_name}-{embedding_model}.pkl", "wb")
    pickle.dump(zip(hidden_features, all_targets), file)
    file.close()

    print(f"Finished extracting embeddings for {dataset_name} dataset")
