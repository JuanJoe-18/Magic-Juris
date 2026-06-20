import os

class RamaJudicialService:
    def __init__(self, mode="mock"):
        self.mode = mode

    def get_actuaciones(self, radicado: str):
        if self.mode == "mock":
            return self._get_mock_actuaciones(radicado)
        return self._get_real_actuaciones(radicado)

    def _get_mock_actuaciones(self, radicado: str):
        # Stub to load from mock JSON
        return []

    def _get_real_actuaciones(self, radicado: str):
        # Stub for real integration
        return []
