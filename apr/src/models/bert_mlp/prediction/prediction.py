import os
# os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

import sys
parent_dir = os.path.dirname(os.getcwd())
sys.path.insert(0, f"{os.getcwd()}/src/models/bert_mlp")

import numpy as np
import torch
import tensorflow as tf
from transformers import BertTokenizer, BertModel

from pathlib import Path
import argparse

from preprocess.preprocess import preprocess_text
from config import config


if torch.cuda.is_available():
    DEVICE = torch.device("cuda")
    print("GPU found (", torch.cuda.get_device_name(torch.cuda.current_device()), ")")
    torch.cuda.set_device(torch.cuda.current_device())
    print("Num device avail: ", torch.cuda.device_count())
else:
    DEVICE = torch.device("cpu")
    print("Running on CPU")


def get_embedding_model(embedding_model):
    if embedding_model == "bert-base":
        tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")
        model = BertModel.from_pretrained("bert-base-uncased", output_hidden_states=True)

    elif embedding_model == "bert-large":
        tokenizer = BertTokenizer.from_pretrained("bert-large-uncased")
        model = BertModel.from_pretrained("bert-large-uncased", output_hidden_states=True)

    else:
        print(f"Unknown pre-trained model: {embedding_model}! Aborting...")
        sys.exit(0)

    return tokenizer, model


def extract_segment_embedding(input, model):
    # print("Inputs shape", np.array(input.input_ids).shape)
    
    # Get the hidden layers from the BERT model

    bert_output = model(**input)
    hidden_layers = bert_output[2]

    # Get the segment embedding from each hidden layer

    segment_embeddings_by_layer = []
    for i in range(n_hl):
        layer_tokens_embeddings = hidden_layers[i].cpu().numpy()
        # print(f"Layer {i} tokens embeddings shape", layer_tokens_embeddings.shape)

        layer_segment_embedding = np.mean(layer_tokens_embeddings, axis=1)
        # print(f"Layer {i} segment embedding shape", layer_segment_embedding.shape)

        segment_embeddings_by_layer.append(layer_segment_embedding)

    # Ponderate the layers to form the segment embedding

    if embedding_layer == "all":
        alphaW = np.full([n_hl], 1 / n_hl)
    else:
        alphaW = np.zeros([n_hl])
        alphaW[int(embedding_layer) - 1] = 1

    segment_embedding = np.einsum("k,kij->ij", alphaW, segment_embeddings_by_layer)
    # print("Segment embedding shape", segment_embedding.shape)

    # Return the segmetn embedding

    return segment_embedding


def extract_text_embedding(text, tokenizer, model):
    # Tokenize the text
    tokens = tokenizer.tokenize(text)
    n_tokens = len(tokens)

    # Create segments of tokens of length `token_length` with an overlap of `overlap`
    start, segments = 0, []
    while start < n_tokens:
        end = min(start + segment_length, n_tokens)
        segment = tokens[start:end]
        segments.append(segment)
        if end == n_tokens:
            break
        start = end - segment_overlap

    # For each of the segments get the embeddings for their tokens
    segments_embeddings_list = []
    with torch.no_grad():
        for segment in segments:
            inputs = tokenizer(
                " ".join(segment), return_tensors="pt", padding=True, truncation=True
            )
            inputs = inputs.to(DEVICE)
            # print("Inputs shape", inputs["input_ids"].shape)

            outputs = model(**inputs)
            # print("Outputs shape", outputs.last_hidden_state.shape)

            text_embedding = outputs.last_hidden_state.cpu().numpy()
            # print("Tokens embeddings shape", text_embedding.shape)

            segment_embedding = extract_segment_embedding(inputs, model)
            # print("Segment embedding shape", segment_embedding.shape)

            segments_embeddings_list.append(segment_embedding)

    if len(segments_embeddings_list) > 1:
        text_embedding = np.concatenate(segments_embeddings_list, axis=0)
        text_embedding = np.mean(text_embedding, axis=0, keepdims=True)
    else:
        text_embedding = segments_embeddings_list[0]

    return text_embedding


def get_finetune_model():
    trait_labels = ["O", "C", "E", "A", "N"]

    path_model = f"{pkl_dir}/finetune_{str(finetune_model).lower()}"

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
        model_name = f"{path_model}/MLP_LM_{trait}.h5"
        abort_if_model_not_exist(model_name)
        models[trait] = tf.keras.models.load_model(model_name)

    return models


def predict(text):
    # Preprocess the text

    text = preprocess_text(text)

    max_tokens = max_text_length
    if len(text.split()) > max_tokens:
        text = " ".join(text.split()[:max_tokens])

    print(f"Predicting - Word count: {len(text.split())}")

    # Extract the text embedding

    tokenizer, model = get_embedding_model(embedding_model)
    model.to(DEVICE)

    embedding = extract_text_embedding(text, tokenizer, model)

    # Make the personality prediction

    models, predictions = get_finetune_model(), {}

    for trait, model in models.items():
        try:
            prediction = model.predict(embedding)
            prediction = prediction[0][1]
            predictions[trait] = prediction

        except BaseException as e:
            print(f"Failed to make prediction: {e}")

    print(f"\nPersonality predictions using {str(finetune_model).upper()}: {predictions}")

    # Return the scores
    scores = []
    for trait, prediction in predictions.items():
        scores.append(prediction)

    return scores


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("-text", type=str)
    args = ap.parse_args()
    text = args.text

    pkl_dir = config["pkl_dir"]

    max_text_length = config["prediction"]["max_text_length"]

    embedding_model = config["embedding"]["model"]
    segment_length = config["embedding"]["max_tokens"]
    segment_overlap = config["embedding"]["segment_overlap"]
    n_hl = config["embedding"]["hidden_layers"]
    embedding_layer = config["embedding"]["embedding_layer"]

    finetune_model = config["finetune"]["model"]


    output = predict(text)

    print("Output:", output)
