import os

config = {
    'pkl_dir': os.getenv("BERT_MLP_PKL_DIR", "src/models/bert_mlp/pkl"),
    'embedding': {
        'model': os.getenv("BERT_MLP_EMBEDDING_MODEL", "bert-base"),
        'hidden_layers': os.getenv("BERT_MLP_EMBEDDING_HIDDEN_LAYERS", 12),
        'embedding_layer': os.getenv("BERT_MLP_EMBEDDING_EMBEDDING_LAYER", 11),
        'hidden_layer_dim': os.getenv("BERT_MLP_EMBEDDING_HIDDEN_LAYER_DIM", 768),
        'max_tokens': os.getenv("BERT_MLP_EMBEDDING_MAX_TOKENS", 512),
        'segment_overlap': os.getenv("BERT_MLP_EMBEDDING_SEGMENT_OVERLAP", 256)
    },
    'finetune': {
        'model': os.getenv("BERT_MLP_FINETUNE_MODEL", "mlp")
    },
    'training': {
        'dataset_name': os.getenv("BERT_MLP_TRAINING_DATASET_NAME", "test"),
        'dataset_path': os.getenv("BERT_MLP_TRAINING_DATASET_PATH", "datasets/discrete/test.csv"),
        'batch_size': os.getenv("BERT_MLP_TRAINING_BATCH_SIZE", 32),
        'seed': os.getenv("BERT_MLP_TRAINING_SEED", 390),
        'mlp': {
            'epochs': os.getenv("BERT_MLP_TRAINING_MLP_EPOCHS", 10),
            'learning_rate': os.getenv("BERT_MLP_TRAINING_MLP_LEARNING_RATE", 0.0005)
        }
    },
    'prediction': {
        'max_text_length': os.getenv("INFER_BERT_MLP_MAX_TOKENS_PER_USER", 1000)
    }
}
