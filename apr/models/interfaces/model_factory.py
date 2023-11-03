from models.interfaces.model import Model

class ModelFactory:

    def get_model(name: str) -> Model:
        if name == "dummy":
            from models.own.dummy_model import DummyModel
            return DummyModel()
        elif name == "mehta":
            from models.mehta.mehta_model import MehtaModel
            return MehtaModel()
