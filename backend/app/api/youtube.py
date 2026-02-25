"""YouTube video search endpoint (no API key required)."""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from pytubefix import Search

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/youtube", tags=["youtube"])


class VideoResult(BaseModel):
    video_id: str
    title: str
    channel: str
    duration: int  # seconds
    thumbnail: str
    url: str


@router.get("/search", response_model=list[VideoResult])
def search_youtube(
    q: str = Query(..., min_length=1, max_length=200, description="Search query"),
    limit: int = Query(10, ge=1, le=20, description="Max results"),
):
    """Search YouTube and return a list of video results."""
    try:
        search = Search(q)
        results: list[VideoResult] = []

        for video in search.videos[:limit]:
            results.append(
                VideoResult(
                    video_id=video.video_id,
                    title=video.title,
                    channel=video.author,
                    duration=video.length,
                    thumbnail=video.thumbnail_url,
                    url=video.watch_url,
                )
            )
        return results

    except Exception as exc:
        logger.exception("YouTube search failed for query=%s", q)
        raise HTTPException(status_code=502, detail="YouTube search unavailable") from exc
