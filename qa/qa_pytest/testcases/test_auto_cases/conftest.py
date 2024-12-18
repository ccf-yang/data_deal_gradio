
import time
from ppioBaseCore.session.SessionManager import SessionManager
import pytest
from common.ReadApiParams import get_api_params_by_key

@pytest.fixture(scope='session', autouse=True)
def setup_function():
    SessionManager().setHeaders({"authorization": get_api_params_by_key("authorization")})

