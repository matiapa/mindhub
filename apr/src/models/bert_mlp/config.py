import os
from dotenv import load_dotenv

load_dotenv('.env')
environment = os.environ.get('ENVIRONMENT', 'local')

print(f"Loading config with environment = {environment}...")
load_dotenv(f'envs/.env.{environment}')
load_dotenv('envs/.env.default')

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
        'model': os.getenv("BERT_MLP_FINETUNE_MODEL", "mlp_lm")
    },
    'training': {
        'dataset_name': os.getenv("BERT_MLP_TRAINING_DATASET_NAME"),
        'datasets_paths': os.getenv("BERT_MLP_TRAINING_DATASETS_PATHS"),
        'batch_size': os.getenv("BERT_MLP_TRAINING_BATCH_SIZE", 32),
        'seed': os.getenv("BERT_MLP_TRAINING_SEED"),
        'mlp': {
            'epochs': os.getenv("BERT_MLP_TRAINING_MLP_EPOCHS", 10),
            'learning_rate': os.getenv("BERT_MLP_TRAINING_MLP_LEARNING_RATE", 0.0005)
        }
    },
    'prediction': {
        'max_text_length': os.getenv("INFER_BERT_MLP_MAX_TOKENS_PER_USER", 1000)
    }
}
