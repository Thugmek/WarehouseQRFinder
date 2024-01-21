import image_sources

class ServiceTask():
    def __init__(self):
        pass

    def start(self):
        pass

    def get_status(self) -> dict:
        pass

class AutoSetLEDs(ServiceTask):
    def __init__(self, image_source:image_sources.GenericSource, device:str, ):
        super().__init__()
        self.image_source = image_source

    def start(self):
        pass

    def get_status(self) -> dict:
        pass

