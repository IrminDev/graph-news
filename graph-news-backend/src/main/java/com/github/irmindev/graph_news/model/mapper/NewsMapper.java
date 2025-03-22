package com.github.irmindev.graph_news.model.mapper;

import java.util.List;

import com.github.irmindev.graph_news.model.dto.NewsDTO;
import com.github.irmindev.graph_news.model.entity.News;

public class NewsMapper {
    public static NewsDTO toDto(News news) {
        return new NewsDTO(news.getId(), news.getTitle(), news.getContent(), UserMapper.toDto(news.getAuthor()));
    }

    public static List<NewsDTO> toDto(List<News> news) {
        return news.stream().map(NewsMapper::toDto).toList();
    }
}
