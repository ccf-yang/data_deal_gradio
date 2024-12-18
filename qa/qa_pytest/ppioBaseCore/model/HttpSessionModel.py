from ppioBaseCore.model.HttpModel import HttpModel
from ppioBaseCore.session import SessionManager


class HttpSessionModel(HttpModel):

    @property
    def option(self):
        return self._option.setRequestObject(obj=SessionManager.getSession())

