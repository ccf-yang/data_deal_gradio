
from ppioBaseCore.data.MarkData import MarkData


class Mark(object):
    mark_key = '_ppio_'
    mark_not_null_keys = ['module']

    def __init__(self, module: str = '', **kwargs):
        """

        :param module: point out which host this api need to use in variable file endpoints
        :param kwargs:
        """
        self._func = ''
        self._keyword = {
            **kwargs,
            **{
                'module': module
            }
        }

    @property
    def keyword(self):

        for _key in self.mark_not_null_keys:
            if _key not in self._keyword or not self._keyword.get(_key):
                raise ValueError('must give a [{0}] value in @api.mark('
                                 '{0}=\'{{here need a value}}\') '.format(_key))

        return self._keyword

    def __call__(self, f):
        self._func = f
        setattr(f, self.mark_key, MarkData(keywords=self.keyword))
        return f





