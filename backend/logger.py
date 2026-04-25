import logging
import os

def configure_logging(log_path: str | None = None):
    if log_path is None:
        log_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'activity.log'))

    root = logging.getLogger()
    if any(isinstance(h, logging.FileHandler) and getattr(h, 'baseFilename', None) == os.path.abspath(log_path) for h in root.handlers):
        return

    root.setLevel(logging.INFO)

    fh = logging.FileHandler(log_path, mode='a', encoding='utf-8')
    fh.setLevel(logging.INFO)
    fmt = logging.Formatter('%(asctime)s | %(levelname)s | %(name)s | %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
    fh.setFormatter(fmt)
    root.addHandler(fh)

    ch = logging.StreamHandler()
    ch.setLevel(logging.INFO)
    ch.setFormatter(fmt)
    root.addHandler(ch)

    root.info(f"Activity logging started (file={log_path})")


def info(msg: str):
    logging.getLogger('activity').info(msg)


def error(msg: str):
    logging.getLogger('activity').error(msg)
