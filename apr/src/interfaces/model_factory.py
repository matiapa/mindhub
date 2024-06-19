from interfaces.model import Model

class ModelFactory:

    def get_model(name: str) -> Model:
        if name == "gpt-fine-tuned":
            from models.gpt_fine_tuned.model_interface import GptFineTunedModel
            return GptFineTunedModel()
        elif name == "mehta":
            from models.bert_mlp.model_interface import BertMlpModel
            return BertMlpModel()
