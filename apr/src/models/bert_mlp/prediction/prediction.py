import os

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

from pathlib import Path
from transformers import BertTokenizer, BertModel

import torch
import numpy as np

import re
import sys
import joblib

from transformers import BertTokenizer, BertModel

import tensorflow as tf

parent_dir = os.path.dirname(os.getcwd())
sys.path.insert(0, parent_dir)
sys.path.insert(0, os.getcwd())

import models.bert_mlp.training.dataset_processors as dataset_processors


if torch.cuda.is_available():
    DEVICE = torch.device("cuda")
    print("GPU found (", torch.cuda.get_device_name(torch.cuda.current_device()), ")")
    torch.cuda.set_device(torch.cuda.current_device())
    print("num device avail: ", torch.cuda.device_count())
else:
    DEVICE = torch.device("cpu")
    print("Running on cpu")


def softmax(x):
    exp_x = np.exp(x)
    return exp_x / np.sum(exp_x)


def get_embedding_model(embedding_model):
    if embedding_model == "bert-base":
        tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")
        model = BertModel.from_pretrained("bert-base-uncased")

    elif embedding_model == "bert-large":
        tokenizer = BertTokenizer.from_pretrained("bert-large-uncased")
        model = BertModel.from_pretrained("bert-large-uncased")

    elif embedding_model == "albert-base":
        tokenizer = BertTokenizer.from_pretrained("albert-base-v2")
        model = BertModel.from_pretrained("albert-base-v2")

    elif embedding_model == "albert-large":
        tokenizer = BertTokenizer.from_pretrained("albert-large-v2")
        model = BertModel.from_pretrained("albert-large-v2")

    else:
        print(f"Unknown pre-trained model: {embedding_model}! Aborting...")
        sys.exit(0)

    return tokenizer, model


def get_finetune_model(pkl_dir, finetune_model):
    trait_labels = ["EXT", "NEU", "AGR", "CON", "OPN"]

    path_model = pkl_dir + "finetune_" + str(finetune_model).lower()

    if not Path(path_model).is_dir():
        print(f"The directory with the selected model was not found: {path_model}")
        sys.exit(0)

    def abort_if_model_not_exist(model_name):
        if not Path(model_name).is_file():
            print(
                f"Model not found: {model_name}. Either the model was not trained or the model name is incorrect! Aborting..."
            )
            sys.exit(0)

    models = {}
    for trait in trait_labels:
        if re.search(r"MLP_LM", str(finetune_model).upper()):
            model_name = f"{path_model}/MLP_LM_{trait}.h5"
            abort_if_model_not_exist(model_name)
            model = tf.keras.models.load_model(model_name)

        elif re.search(r"SVM_LM", str(finetune_model).upper()):
            model_name = f"{path_model}/SVM_LM_{trait}.pkl"
            abort_if_model_not_exist(model_name)
            model = joblib.load(model_name)

        else:
            print(f"Unknown finetune model: {model_name}! Aborting...")
            sys.exit(0)

        models[trait] = model

    return models


def extract_bert_features(text, tokenizer, model, token_length, overlap=256):
    # Tokenize the text
    tokens = tokenizer.tokenize(text)
    n_tokens = len(tokens)

    # Create segments of tokens of length `token_length` with an overlap of `overlap`
    start, segments = 0, []
    while start < n_tokens:
        end = min(start + token_length, n_tokens)
        segment = tokens[start:end]
        segments.append(segment)
        if end == n_tokens:
            break
        start = end - overlap

    # For each of the segments get the embeddings for their tokens
    embeddings_list = []
    with torch.no_grad():
        for segment in segments:
            inputs = tokenizer(
                " ".join(segment), return_tensors="pt", padding=True, truncation=True
            )
            inputs = inputs.to(DEVICE)
            outputs = model(**inputs)
            embeddings = outputs.last_hidden_state[:, 0, :].cpu().numpy()
            embeddings_list.append(embeddings)

    if len(embeddings_list) > 1:
        embeddings = np.concatenate(embeddings_list, axis=0)
        embeddings = np.mean(embeddings, axis=0, keepdims=True)
    else:
        embeddings = embeddings_list[0]

    return embeddings


def predict(new_text, embedding_model, segment_length, finetune_model, pkl_dir):
    # Preprocess the text
    new_text_pre = dataset_processors.preprocess_text(new_text)

    # Load the feature extraction model
    tokenizer, model = get_embedding_model(embedding_model)
    model.to(DEVICE)

    # Extract the features
    new_embeddings = extract_bert_features(new_text_pre, tokenizer, model, segment_length)

    # Load the prediction models
    models, predictions = get_finetune_model(pkl_dir, finetune_model), {}

    # Make the predictions
    for trait, model in models.items():
        try:
            prediction = model.predict(new_embeddings)
            prediction = softmax(prediction)
            prediction = prediction[0][1]
            predictions[trait] = prediction

        except BaseException as e:
            print(f"Failed to make prediction: {e}")

    print(f"\nPersonality predictions using {str(finetune_model).upper()}:")

    # Return the scores
    scores = []
    for trait, prediction in predictions.items():
        scores.append(prediction)

    return scores

predict("This is a new short sample text", embedding_model='bert-base', segment_length=512, finetune_model='mlp_lm', pkl_dir='models/mehta/data/')
