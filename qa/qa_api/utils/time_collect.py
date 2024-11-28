from datetime import datetime

def human_datetime():
    """
    Return datetime in human readable format
    """
    return datetime.now().strftime('%Y-%m-%d %H:%M:%S')
