from pathlib import Path
import os
from datetime import datetime, timedelta

VIDEO_PATH = Path(".").absolute() / "videos"

for vid in VIDEO_PATH.glob("*"):
    create_time = os.path.getctime(vid)
    create_time = datetime.fromtimestamp(create_time)
    print(vid)
    print(create_time)

    if create_time < datetime.now() - timedelta(hours=1):
        os.remove(vid)
