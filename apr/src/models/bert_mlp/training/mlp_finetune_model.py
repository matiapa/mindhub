import os
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

import sys
sys.path.insert(0, os.getcwd())

import numpy as np
import tensorflow as tf
from sklearn.model_selection import StratifiedKFold

import pickle
from pathlib import Path

from config import config


def get_inputs():
    file = open(f"{pkl_dir}/{dataset_name}-{embedding_model_name}.pkl", "rb")
    data = pickle.load(file)
    data_x, data_y = list(zip(*data))
    file.close()

    # print("Inputs shape pre-transformation", np.array(data_x).shape)
    # print("Targets shape pre-transformation", np.array(data_y).shape)

    # Transform the input and output
    # The input is a matrix in the form (n_batches, n_layers, n_samples, hidden_dim), we need to transform it to (n_samples, hidden_dim).
    # For doing so batches will be concatenated and layers will be ponderated using the weights specified by the alphaW vector.
    # The output will only be concatenated, going from (n_batches, n_samples, out_dim) to (n_samples, out_dim).

    if embedding_hl == "all":
        alphaW = np.full([hidden_layers], 1 / hidden_layers)
    else:
        alphaW = np.zeros([hidden_layers])
        alphaW[int(embedding_hl) - 1] = 1

    inputs = []
    targets = []
    n_batches = len(data_y)
    for i in range(n_batches):
        inputs.extend(np.einsum("k,kij->ij", alphaW, data_x[i]))
        targets.extend(data_y[i])

    inputs = np.array(inputs)
    targets = np.array(targets)

    # print("Inputs shape post-transformation", inputs .shape)
    # print("Targets shape post-transformation", targets.shape)

    return inputs, targets


def training(inputs, targets):
    # Train MLP model for each trait on 10-fold cross-validation

    trait_labels = ["O", "C", "E", "A", "N"]
        
    n_splits = min(10, len(inputs)-1)

    n_classes = 2

    best_models, best_model, best_accuracy = {}, None, 0.0

    for trait_idx in range(targets.shape[1]):
        print(f"\nTraining trait {trait_labels[trait_idx]}...")

        # Get the targets for the current trait
        trait_targets = targets[:, trait_idx]

        # Create a k-fold cross-validation object
        skf = StratifiedKFold(n_splits=n_splits, shuffle=False)

        i = 0
        for train_index, test_index in skf.split(inputs, trait_targets):
            # Split the dataset into training and testing sets

            x_train, x_test = inputs[train_index], inputs[test_index]
            y_train, y_test = trait_targets[train_index], trait_targets[test_index]

            print(f"Fold {i + 1}/{n_splits}: Using {len(x_train)} samples for training and {len(x_test)} for testing.")

            # Convert targets to one-hot encoding

            y_train = tf.keras.utils.to_categorical(y_train, num_classes=n_classes)
            y_test = tf.keras.utils.to_categorical(y_test, num_classes=n_classes)
            
            # Define the neural network architecture

            model = tf.keras.models.Sequential()

            model.add(
                tf.keras.layers.Dense(50, input_dim=hidden_dim, activation="relu")
            )
            model.add(
                tf.keras.layers.Dense(n_classes, activation="softmax")
            )

            model.compile(
                optimizer=tf.keras.optimizers.Adam(learning_rate=learning_rate),
                loss=tf.keras.losses.BinaryCrossentropy(from_logits=True),
                metrics=["mse", "accuracy"],
            )

            # Train the neural network

            history = model.fit(
                x_train,
                y_train,
                epochs=epochs,
                batch_size=batch_size,
                validation_data=(x_test, y_test),
                verbose=0,
            )

            # Check if the current model is the best so far

            max_val_accuracy = max(history.history["val_accuracy"])

            if max_val_accuracy > best_accuracy:
                best_accuracy = max_val_accuracy
                best_model = model

            i += 1

        # Store the best model for this trait

        best_models[trait_labels[trait_idx]] = best_model

    # Save the best models to separate files

    path = f"{pkl_dir}/finetune_mlp_lm/"
    Path(path).mkdir(parents=True, exist_ok=True)

    for trait_label, best_model in best_models.items():
        best_model.save(f"{path}/MLP_LM_{trait_label}.h5")


if __name__ == "__main__":
    pkl_dir = config["pkl_dir"]

    dataset_name = config["training"]["dataset_name"]
    batch_size = config["training"]["batch_size"]
    epochs = config["training"]["mlp"]["epochs"]
    learning_rate = config["training"]["mlp"]["learning_rate"]
    seed = config["training"]["seed"]

    embedding_model_name = config["embedding"]["model"]
    embedding_hl = config["embedding"]["embedding_layer"]
    hidden_layers = config["embedding"]["hidden_layers"]
    hidden_dim = config["embedding"]["hidden_layer_dim"]

    if seed == None:
        seed = np.random.randint(0,1000)
    print("Seed", seed)

    np.random.seed(seed)
    tf.random.set_seed(seed)

    inputs, targets = get_inputs()
    
    training(inputs, targets)
