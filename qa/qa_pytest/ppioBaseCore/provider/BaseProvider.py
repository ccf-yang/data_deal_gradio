
import inspect
from abc import ABCMeta, abstractmethod
from functools import update_wrapper

from ppioBaseCore.data.MarkData import MarkData


class BaseProvider(metaclass=ABCMeta):

    def __init__(self, method='', need_mark=True, check_return=True):
        self.method = method
        self.decorator = None
        self.path = ''

        self.args = tuple()
        self.kwargs = dict()
        self.need_mark = need_mark
        self.check_return = check_return

    def __call__(self, path=''):
        self.path = path
        return self.hook

    @abstractmethod
    def handle(self, path: str = '', mark: MarkData = '', method: str = '',
               params: dict = None, ori_params: dict = None):
        pass

    @staticmethod
    def handleArgParams(f, *args, **kwargs):
        # f: 如  <function PiBillingAPI.api_bill_monthly_detail at 0x10c7877a0>
        args_pec = inspect.getfullargspec(f)
        ori_kwargs = {}

        # get func key-value parameters
        """
        FullArgSpec(args=['self', 'data'], varargs=None, varkw=None, defaults=None,
        kwonlyargs=[], kwonlydefaults=None, annotations={})

        """
        keys = args_pec.args    # ['self', 'data']
        defaults = list(args_pec.defaults) if args_pec.defaults else []
        key_word_only_defaults = args_pec.kwonlydefaults
        if len(keys) < 1:
            pass
        elif keys[0] == 'self':
            keys = keys[1:]
            args = args[1:]
        if len(keys) > len(defaults):
            if defaults:
                for _ in range(len(defaults)):
                    ori_kwargs.update({keys.pop(): defaults.pop()})
            for k, v in zip(keys, list(args)):
                ori_kwargs.update({k: v})

        if key_word_only_defaults and isinstance(key_word_only_defaults, dict):
            ori_kwargs.update(key_word_only_defaults)
        ori_kwargs.update(kwargs)
        # ori_kwargs: {'data': {'date': '2021-07', 'user_account': '18321070767'}}
        return ori_kwargs

    def hook(self, f):
        def decorator(*args, **kwargs):
            _mark_tag = '_ppio_'
            _mark = getattr(self.decorator, _mark_tag, getattr(f, _mark_tag, None))   # <ppioBaseCore.data.MarkData.MarkData>

            if self.need_mark and not _mark:
                raise ValueError('must use @api.mark() for each api request')

            # need a default mark object here
            _mark = _mark or MarkData()
            _mark.doc = f.__doc__
            _parse_params = f(*args, **kwargs)

            # set origin args and kwargs
            self.ori_args = args
            self.ori_kwargs = kwargs

            return self.handle(
                path=self.path, method=self.method, params=_parse_params,
                ori_params=self.handleArgParams(f, *args, **kwargs),
                mark=_mark)
        self.decorator = update_wrapper(decorator, f)   # f--->  <function QingFlowAPI.api_app_key_apply_filte>
        return self.decorator
