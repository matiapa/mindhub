from typing import List, Tuple
from interfaces.text import Text
from interfaces.model import Model
from models.bert_mlp.prediction.prediction import predict

class BertMlpModel(Model):
    
    def infer(self, texts: List[Text]) -> Tuple[float]:
        text = '\n'.join(map(lambda t : t.rawText, texts))
        vec = predict(text, embedding_model='bert-base', segment_length=512, finetune_model='mlp_lm', pkl_dir='models/mehta/data/')
        return (float(vec[0]), float(vec[1]), float(vec[2]), float(vec[3]), float(vec[4]))