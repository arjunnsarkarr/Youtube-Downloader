from typing import Dict, List
from pytube import YouTube


class YouTubeDownloader:
    def __init__(self, link) -> None:
        self.link = link
        self.yt = YouTube(link)
        self.hasmap = {}

    async def get_available_streams(self) -> List[Dict | None]:
        streams: List = self.yt.streams.filter(file_extension="mp4").all()
        self.hasmap = {str(i): streams[i] for i in range(len(streams))}
        res_list = []
        for stream in streams:
            res = {}
            res["type"] = stream.type
            res["resolution"] = stream.resolution
            res["is_progressive"] = stream.is_progressive
            res_list.append(res)
        return res_list
