from ppioBaseCore.data.MarkData import MarkData


class ApiOption(object):

    def __init__(self):
        # log or not
        self._log = True

        # api mark obj
        self._mark = None

        # request obj, this is request object
        self._obj = None

        self._timeout = 0

    @property
    def timeout(self) -> int:
        return self._timeout

    @property
    def obj(self):
        return self._obj

    @property
    def mark(self) -> MarkData:
        return self._mark or MarkData()

    @property
    def log(self):
        return self._log

    def setNotLog(self):
        self._log = False
        return self

    def setMark(self, mark):
        self._mark = mark
        return self

    def setTimeout(self, timeout=0):
        self._timeout = timeout
        return self

    def setRequestObject(self, obj) -> object:
        # self: <ppioBaseCore.model.Option.HttpOption.HttpOption object at 0x10ceadc50>
        # obj: <requests.sessions.Session object at 0x10c856590>
        self._obj = obj
        return self
