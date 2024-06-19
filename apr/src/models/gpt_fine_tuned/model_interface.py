from typing import List, Tuple
from interfaces.text import Text
from interfaces.model import Model
from models.gpt_fine_tuned.predict import predict

class GptFineTunedModel(Model):
    
    def infer(self, texts: List[Text]) -> Tuple[float]:
        texts = list(map(lambda t : t.rawText, texts))
        
        vec = predict(texts)
        
        return (vec[0]/5, vec[1]/5, vec[2]/5, vec[3]/5, vec[4]/5)
    