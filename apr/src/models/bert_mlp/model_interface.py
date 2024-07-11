from typing import List, Tuple
from interfaces.text import Text
from interfaces.model import Model
from models.bert_mlp.prediction.prediction import predict
import os

class BertMlpModel(Model):
    
    def infer(self, texts: List[Text]) -> Tuple[float]:
        text = '\n'.join(map(lambda t : t.rawText, texts))
        vec = predict(text)
        return (float(vec[0]), float(vec[1]), float(vec[2]), float(vec[3]), float(vec[4]))