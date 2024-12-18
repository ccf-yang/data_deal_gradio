import logging
import random
import string
logger = logging.getLogger()


class VariableExecution(object):

    @classmethod
    def get_variable_value_in_pyenv(cls, key, default_value=None):
        """
        The keyword used to get variable value in python.
        global value in python
        :param key:
        :param default_value:
        :return: the value of the key
        """
        if key in globals():
            return globals().get(key)
        else:
            return default_value

    @staticmethod
    def get_random_from_list(items):
        return random.choice(items)

    @staticmethod
    def get_random_str(length=8):
        return ''.join(random.sample(string.ascii_letters + string.digits, length))

    @classmethod
    def get_endpoints(cls, key='ENDPOINTS'):
        return cls.get_variable_value_in_pyenv(key)

    @classmethod
    def get_appkey(cls):
        return cls.get_variable_value_in_pyenv('APP_KEY')
