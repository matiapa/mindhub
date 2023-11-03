from typing import List, Tuple
from models.interfaces.text import Text
from models.interfaces.model import Model

class DummyModel(Model):
    
    def infer(self, texts: List[Text]) -> Tuple[float]:
        text = '\n'.join(map(lambda t : t.rawText, texts))
        print(len(text))
        return (1, 2, 3, 4, 5)